import { imageSize } from "image-size";
import { MAX_UPLOAD_BYTES } from "@repo/schemas/designs";
import type {
  CreateDesignInput,
  DesignDetail,
  DesignListItem,
  GenerateDesignInput,
  GenerateDesignResult,
  GenerateSource,
  SourceUploadResponse,
} from "@repo/schemas/designs";

import { imageGeneration } from "@/adapters/image-generation";
import { imageUnderstanding } from "@/adapters/image-understanding";
import { BadRequestError, NotFoundError } from "@/core/errors";
import { mimeForImageType } from "@/core/image-mime";
import { logger } from "@/core/logger";
import {
  catalogKeyFromPublicUrl,
  extensionForMime,
  headObject,
  putObject,
  roomSourceKey,
  storagePublicUrl,
} from "@/core/storage";
import { prisma } from "@/database/prisma";
import { queueGeneration } from "@/services/generation-job.service";

export async function listDesigns(
  ownerId: string,
): Promise<{ items: DesignListItem[] }> {
  // The gallery renders trashed designs (its Trash tab) too, so unlike the
  // detail reads below this query deliberately keeps `deletedAt != null` rows.
  const designs = await prisma.design.findMany({
    where: { ownerId },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      status: true,
      source: true,
      isFavorite: true,
      updatedAt: true,
      deletedAt: true,
      rooms: {
        where: { deletedAt: null },
        select: {
          generations: {
            where: {
              assets: { some: { type: "generated", deletedAt: null } },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              createdAt: true,
              assets: {
                where: { type: "generated", deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { storageKey: true },
              },
            },
          },
        },
      },
    },
  });

  return {
    items: designs.map(({ updatedAt, deletedAt, rooms, ...design }) => {
      const latestGeneration = rooms
        .flatMap((room) => room.generations)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      return {
        ...design,
        trashed: deletedAt !== null,
        updatedAt: updatedAt.toISOString(),
        generatedImageUrl: storagePublicUrl(
          latestGeneration?.assets[0]?.storageKey,
        ),
      };
    }),
  };
}

export async function createDesign(ownerId: string, input: CreateDesignInput) {
  const { name, description, type, roomTypeId, roomTypeLabel } = input;

  if (roomTypeId) {
    const roomType = await prisma.roomType.findFirst({
      where: { id: roomTypeId, isActive: true },
      select: { id: true },
    });
    if (!roomType) {
      throw new BadRequestError("Room type not found");
    }
  }

  return prisma.$transaction(async (tx) => {
    const design = await tx.design.create({
      data: {
        ownerId,
        type,
        title: name,
        description: description ?? null,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    const room =
      type === "single_room"
        ? await tx.room.create({
            data: {
              designId: design.id,
              roomTypeId: roomTypeId ?? null,
              roomTypeLabel: roomTypeId ? null : (roomTypeLabel ?? null),
              roomTypeSource: roomTypeId || roomTypeLabel ? "user" : null,
            },
            select: { id: true, roomTypeId: true, roomTypeLabel: true },
          })
        : null;

    return { ...design, room, latestGenerationId: null };
  });
}

export async function getDesignById(
  ownerId: string,
  id: string,
): Promise<DesignDetail> {
  const design = await prisma.design.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      createdAt: true,
      rooms: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          id: true,
          roomTypeId: true,
          roomTypeLabel: true,
          generations: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  if (!design) {
    throw new NotFoundError("Design not found");
  }

  const { rooms, createdAt, ...rest } = design;
  const room = rooms[0];

  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    room: room
      ? {
          id: room.id,
          roomTypeId: room.roomTypeId,
          roomTypeLabel: room.roomTypeLabel,
        }
      : null,
    latestGenerationId: room?.generations[0]?.id ?? null,
  };
}

/** Star / unstar a design. Throws if the design isn't the owner's. */
export async function setDesignFavorite(
  ownerId: string,
  designId: string,
  isFavorite: boolean,
): Promise<void> {
  const { count } = await prisma.design.updateMany({
    where: { id: designId, ownerId, deletedAt: null },
    data: { isFavorite },
  });
  if (count === 0) {
    throw new NotFoundError("Design not found");
  }
}

/** Move a design to the trash (soft delete) — still recoverable via restore. */
export async function trashDesign(
  ownerId: string,
  designId: string,
): Promise<void> {
  const { count } = await prisma.design.updateMany({
    where: { id: designId, ownerId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (count === 0) {
    throw new NotFoundError("Design not found");
  }
}

/** Restore a design from the trash. */
export async function restoreDesign(
  ownerId: string,
  designId: string,
): Promise<void> {
  const { count } = await prisma.design.updateMany({
    where: { id: designId, ownerId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (count === 0) {
    throw new NotFoundError("Design not found");
  }
}

/** Permanently delete a design and its rooms/assets/generations (cascade). */
export async function deleteDesign(
  ownerId: string,
  designId: string,
): Promise<void> {
  const { count } = await prisma.design.deleteMany({
    where: { id: designId, ownerId },
  });
  if (count === 0) {
    throw new NotFoundError("Design not found");
  }
}

export async function storeSourceUpload(
  ownerId: string,
  designId: string,
  bytes: Buffer,
): Promise<SourceUploadResponse> {
  const design = await getDesignById(ownerId, designId);

  if (!design.room) {
    throw new BadRequestError("This design has no room to upload a photo for");
  }
  if (bytes.length === 0) {
    throw new BadRequestError("Image file is required");
  }
  if (bytes.length > MAX_UPLOAD_BYTES) {
    throw new BadRequestError("Uploaded photo is too large");
  }

  let dimensions: ReturnType<typeof imageSize>;
  try {
    dimensions = imageSize(bytes);
  } catch {
    throw new BadRequestError("Uploaded file is not a valid image");
  }
  const { width, height, type } = dimensions;
  const mimeType = mimeForImageType(type);
  if (!width || !height || !mimeType) {
    throw new BadRequestError("Uploaded image format is not supported");
  }

  // Reject obvious non-room photos before storing. Fail open: only an explicit
  // "not a room" verdict blocks — a provider/network error lets the upload
  // through rather than breaking uploads on a flaky detector.
  try {
    const dataUri = `data:${mimeType};base64,${bytes.toString("base64")}`;
    const check = await imageUnderstanding.isInteriorRoom(dataUri);
    if (!check.ok) {
      throw new BadRequestError(check.reason ?? "That doesn't look like a room photo.");
    }
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    logger.warn("Room detection skipped", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const storageKey = roomSourceKey(design.room.id, extensionForMime(mimeType));
  await putObject({
    key: storageKey,
    body: bytes,
    contentType: mimeType,
  });

  return { storageKey, mimeType, sizeBytes: bytes.length, width, height };
}

type SourceAssetData = {
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
};

/**
 * Turn a chosen sample into a source the room owns: fetch our own sample bytes
 * (guarded to our R2 host, so a forged `imageUrl` can't make us fetch an
 * arbitrary URL), read their real dimensions + format, and re-upload under a
 * room-scoped key. Returns the metadata the `Asset` row needs — which a sample,
 * unlike an upload, doesn't carry.
 */
async function materializeSampleSource(
  roomId: string,
  roomTypeId: string | null,
  imageUrl: string,
): Promise<SourceAssetData> {
  const catalogKey = catalogKeyFromPublicUrl(imageUrl);
  if (!catalogKey || !roomTypeId) {
    throw new BadRequestError("Unrecognized sample image");
  }

  const roomType = await prisma.roomType.findFirst({
    where: { id: roomTypeId, isActive: true },
    select: { sampleImageKeys: true },
  });
  if (!roomType?.sampleImageKeys.includes(catalogKey)) {
    throw new BadRequestError("Unrecognized sample image");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new BadRequestError("Couldn't read the selected sample image");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const { width, height, type } = imageSize(bytes);
  if (!width || !height) {
    throw new BadRequestError("Couldn't read the sample image's dimensions");
  }

  // Derive the key extension and content type from the same detected format.
  const mimeType = mimeForImageType(type);
  if (!type || !mimeType) {
    throw new BadRequestError("Sample image format is not supported");
  }

  const storageKey = roomSourceKey(roomId, type);
  await putObject({ key: storageKey, body: bytes, contentType: mimeType });

  return { storageKey, mimeType, sizeBytes: bytes.length, width, height };
}

/** Confirm the uploaded object still exists before starting generation. */
async function verifyUploadedSource(
  roomId: string,
  source: Extract<GenerateSource, { kind: "upload" }>,
): Promise<SourceAssetData> {
  const prefix = `rooms/${roomId}/sources/`;
  const fileName = source.storageKey.slice(prefix.length);
  if (
    !source.storageKey.startsWith(prefix) ||
    !fileName ||
    fileName.includes("/") ||
    fileName.includes("\\")
  ) {
    throw new BadRequestError("Uploaded photo doesn't belong to this design");
  }

  const head = await headObject(source.storageKey).catch(() => {
    throw new BadRequestError("Uploaded photo wasn't found — please try again");
  });

  const sizeBytes = head.contentLength ?? source.sizeBytes;
  if (sizeBytes > MAX_UPLOAD_BYTES) {
    throw new BadRequestError("Uploaded photo is too large");
  }
  if (head.contentType && head.contentType !== source.mimeType) {
    throw new BadRequestError("Uploaded photo type doesn't match the request");
  }

  return {
    storageKey: source.storageKey,
    mimeType: source.mimeType,
    sizeBytes,
    width: source.width,
    height: source.height,
  };
}

function resolveSourceData(
  roomId: string,
  roomTypeId: string | null,
  source: GenerateSource,
): Promise<SourceAssetData> {
  return source.kind === "upload"
    ? verifyUploadedSource(roomId, source)
    : materializeSampleSource(roomId, roomTypeId, source.imageUrl);
}

async function resolveDesignStyles(codes: string[] = []) {
  const unique = [...new Set(codes)];

  const styles = await prisma.designStyle.findMany({
    where: { code: { in: unique }, isActive: true },
    select: { id: true, code: true },
  });

  if (styles.length !== unique.length) {
    const found = new Set(styles.map((style) => style.code));
    const missing = unique.filter((code) => !found.has(code));
    throw new BadRequestError(`Unknown design style: ${missing.join(", ")}`);
  }

  return styles;
}

/**
 * Start a single-room redesign: resolve the room, validate the styles, resolve
 * the source photo's metadata, then create the source `Asset` + `Generation`
 * (+ its style links) in one transaction and enqueue it for the worker. Styles
 * are validated before any writes, so a rejected request can't leave an orphan
 * row.
 */
export async function generateDesign(
  ownerId: string,
  designId: string,
  input: GenerateDesignInput,
): Promise<GenerateDesignResult> {
  const design = await getDesignById(ownerId, designId);
  if (!design.room) {
    throw new BadRequestError("This design has no room to redesign");
  }
  const roomId = design.room.id;

  const styles = await resolveDesignStyles(input.styles);
  const source = await resolveSourceData(
    roomId,
    design.room.roomTypeId,
    input.source,
  );

  const generation = await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.create({
      data: {
        roomId,
        type: "source",
        storageKey: source.storageKey,
        mimeType: source.mimeType,
        sizeBytes: BigInt(source.sizeBytes),
        width: source.width,
        height: source.height,
      },
      select: { id: true },
    });

    const created = await tx.generation.create({
      data: {
        roomId,
        sourceAssetId: asset.id,
        provider: imageGeneration.provider,
        modelId: imageGeneration.modelId,
        status: "pending",
        parameters: { styles: styles.map((style) => style.code) },
        additionalDetails: input.details ?? null,
      },
      select: { id: true, status: true },
    });

    await tx.generationDesignStyle.createMany({
      data: styles.map((style) => ({
        generationId: created.id,
        designStyleId: style.id,
      })),
    });

    return created;
  });

  return queueGeneration(generation.id);
}
