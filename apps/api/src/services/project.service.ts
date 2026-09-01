import { imageSize } from "image-size";
import { MAX_UPLOAD_BYTES } from "@repo/schemas/projects";
import type {
  CreateProjectInput,
  GenerateDesignInput,
  GenerateDesignResult,
  GenerateSource,
  ProjectDetail,
  ProjectListItem,
  SourceUploadResponse,
} from "@repo/schemas/projects";

import { imageGeneration } from "@/adapters/image-generation";
import { BadRequestError, NotFoundError } from "@/core/errors";
import { mimeForImageType } from "@/core/image-mime";
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

export async function listProjects(
  ownerId: string,
): Promise<{ items: ProjectListItem[] }> {
  const projects = await prisma.project.findMany({
    where: { ownerId, deletedAt: null },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      status: true,
      updatedAt: true,
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
    items: projects.map(({ updatedAt, rooms, ...project }) => {
      const latestGeneration = rooms
        .flatMap((room) => room.generations)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      return {
        ...project,
        updatedAt: updatedAt.toISOString(),
        generatedImageUrl: storagePublicUrl(
          latestGeneration?.assets[0]?.storageKey,
        ),
      };
    }),
  };
}

export async function createProject(
  ownerId: string,
  input: CreateProjectInput,
) {
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
    const project = await tx.project.create({
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
              projectId: project.id,
              roomTypeId: roomTypeId ?? null,
              roomTypeLabel: roomTypeId ? null : (roomTypeLabel ?? null),
              roomTypeSource: roomTypeId || roomTypeLabel ? "user" : null,
            },
            select: { id: true, roomTypeId: true, roomTypeLabel: true },
          })
        : null;

    return { ...project, room, latestGenerationId: null };
  });
}

export async function getProjectById(
  ownerId: string,
  id: string,
): Promise<ProjectDetail> {
  const project = await prisma.project.findFirst({
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

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const { rooms, createdAt, ...rest } = project;
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

export async function storeSourceUpload(
  ownerId: string,
  projectId: string,
  bytes: Buffer,
): Promise<SourceUploadResponse> {
  const project = await getProjectById(ownerId, projectId);

  if (!project.room) {
    throw new BadRequestError("This project has no room to upload a photo for");
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

  const storageKey = roomSourceKey(project.room.id, extensionForMime(mimeType));
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
    throw new BadRequestError("Uploaded photo doesn't belong to this project");
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
  projectId: string,
  input: GenerateDesignInput,
): Promise<GenerateDesignResult> {
  const project = await getProjectById(ownerId, projectId);
  if (!project.room) {
    throw new BadRequestError("This project has no room to redesign");
  }
  const roomId = project.room.id;

  const styles = await resolveDesignStyles(input.styles);
  const source = await resolveSourceData(
    roomId,
    project.room.roomTypeId,
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
