import type {
  GenerateDesignResult,
  GenerationDetail,
} from "@repo/schemas/projects";

import { imageGeneration } from "@/adapters/image-generation";
import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors";
import { headObject, storagePublicUrl } from "@/core/storage";
import { prisma } from "@/database/prisma";
import { queueGeneration } from "@/services/generation-job.service";

const RUNNING_STATUSES = new Set(["pending", "queued", "processing"]);

/**
 * Load a redesign job for the results view, scoped to its owner (generation →
 * room → project → `ownerId`). Returns the source image plus one output per
 * rendered style; the web app polls this until `status` is terminal.
 */
export async function getGenerationById(
  ownerId: string,
  generationId: string,
): Promise<GenerationDetail> {
  const generation = await prisma.generation.findFirst({
    where: {
      id: generationId,
      room: { project: { ownerId, deletedAt: null } },
    },
    select: {
      id: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      sourceAsset: { select: { storageKey: true } },
      assets: {
        where: { type: "generated", deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, styleCode: true, storageKey: true },
      },
    },
  });

  if (!generation) {
    throw new NotFoundError("Generation not found");
  }

  const sourceImageUrl = storagePublicUrl(generation.sourceAsset.storageKey);
  if (!sourceImageUrl) {
    throw new Error("Source asset has no public URL (is storage configured?)");
  }

  const outputs = generation.assets.flatMap((asset) => {
    const imageUrl = storagePublicUrl(asset.storageKey);
    return imageUrl
      ? [{ id: asset.id, styleCode: asset.styleCode, imageUrl }]
      : [];
  });

  return {
    id: generation.id,
    status: generation.status,
    sourceImageUrl,
    outputs,
    errorMessage: generation.errorMessage,
    createdAt: generation.createdAt.toISOString(),
  };
}

export async function regenerateGeneration(
  ownerId: string,
  generationId: string,
): Promise<GenerateDesignResult> {
  const original = await prisma.generation.findFirst({
    where: {
      id: generationId,
      room: { project: { ownerId, deletedAt: null } },
    },
    select: {
      status: true,
      roomId: true,
      additionalDetails: true,
      sourceAsset: {
        select: { id: true, storageKey: true, deletedAt: true },
      },
      designStyles: {
        select: {
          designStyleId: true,
          designStyle: { select: { code: true } },
        },
      },
    },
  });

  if (!original) {
    throw new NotFoundError("Generation not found");
  }
  if (RUNNING_STATUSES.has(original.status)) {
    throw new ConflictError("Generation is still in progress");
  }
  if (original.sourceAsset.deletedAt) {
    throw new BadRequestError("Original source image is no longer available");
  }

  await headObject(original.sourceAsset.storageKey).catch(() => {
    throw new BadRequestError("Original source image is no longer available");
  });

  const styleCodes = original.designStyles.map(
    ({ designStyle }) => designStyle.code,
  );
  const generation = await prisma.$transaction(async (tx) => {
    const created = await tx.generation.create({
      data: {
        roomId: original.roomId,
        sourceAssetId: original.sourceAsset.id,
        provider: imageGeneration.provider,
        modelId: imageGeneration.modelId,
        status: "pending",
        parameters: { styles: styleCodes },
        additionalDetails: original.additionalDetails,
      },
      select: { id: true, status: true },
    });

    await tx.generationDesignStyle.createMany({
      data: original.designStyles.map(({ designStyleId }) => ({
        generationId: created.id,
        designStyleId,
      })),
    });

    return created;
  });

  return queueGeneration(generation.id);
}
