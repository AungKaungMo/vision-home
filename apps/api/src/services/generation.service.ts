import {
  detectedProductSchema,
  type GenerateDesignResult,
  type GenerationDetail,
  type GenerationProducts,
} from "@repo/schemas/designs";
import { z } from "zod";

import { imageGeneration } from "@/adapters/image-generation";
import { imageUnderstanding } from "@/adapters/image-understanding";
import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors";
import { headObject, storagePublicUrl } from "@/core/storage";
import { prisma } from "@/database/prisma";
import { queueGeneration } from "@/services/generation-job.service";

const storedProductsSchema = z.array(detectedProductSchema);

const RUNNING_STATUSES = new Set(["pending", "queued", "processing"]);

/**
 * Load a redesign job for the results view, scoped to its owner (generation →
 * room → design → `ownerId`). Returns the source image plus one output per
 * rendered style; the web app polls this until `status` is terminal.
 */
export async function getGenerationById(
  ownerId: string,
  generationId: string,
): Promise<GenerationDetail> {
  const generation = await prisma.generation.findFirst({
    where: {
      id: generationId,
      room: { design: { ownerId, deletedAt: null } },
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

/**
 * "Shop this look" for a completed render, scoped to its owner. The vision pass
 * is expensive, so the detected products are cached on the generation on first
 * request and replayed afterwards. A render with no generated output yet (still
 * running, or failed) simply yields an empty list rather than an error.
 */
export async function getGenerationProducts(
  ownerId: string,
  generationId: string,
): Promise<GenerationProducts> {
  const generation = await prisma.generation.findFirst({
    where: {
      id: generationId,
      room: { design: { ownerId, deletedAt: null } },
    },
    select: {
      products: true,
      assets: {
        where: { type: "generated", deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { storageKey: true },
      },
    },
  });

  if (!generation) {
    throw new NotFoundError("Generation not found");
  }

  if (generation.products !== null) {
    // Tolerate a legacy/garbled cache by re-detecting rather than 500ing.
    const cached = storedProductsSchema.safeParse(generation.products);
    if (cached.success) {
      return { products: cached.data };
    }
  }

  const renderUrl = storagePublicUrl(generation.assets.at(0)?.storageKey);
  if (!renderUrl) {
    return { products: [] };
  }

  const products = await imageUnderstanding.detectProducts(renderUrl);
  await prisma.generation.update({
    where: { id: generationId },
    data: { products },
  });

  return { products };
}

export async function regenerateGeneration(
  ownerId: string,
  generationId: string,
): Promise<GenerateDesignResult> {
  const original = await prisma.generation.findFirst({
    where: {
      id: generationId,
      room: { design: { ownerId, deletedAt: null } },
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
