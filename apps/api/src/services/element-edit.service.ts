import type {
  ApplyElementEditsInput,
  GenerateDesignResult,
} from "@repo/schemas/designs";

import { imageGeneration } from "@/adapters/image-generation";
import { BadRequestError, NotFoundError } from "@/core/errors";
import { headObject } from "@/core/storage";
import { prisma } from "@/database/prisma";
import { queueGeneration } from "@/services/generation-job.service";

/**
 * Apply localized element edits to a generated render. Modeled on
 * `regenerateGeneration`: the edited render becomes a new `Generation` whose
 * source asset is the base render, so the whole async lifecycle and results UI
 * work unchanged. The regions/instructions ride along in `parameters` for the
 * worker's edit path to consume.
 */
export async function applyElementEdits(
  ownerId: string,
  baseAssetId: string,
  input: ApplyElementEditsInput,
): Promise<GenerateDesignResult> {
  const base = await prisma.asset.findFirst({
    where: {
      id: baseAssetId,
      type: "generated",
      deletedAt: null,
      room: { design: { ownerId, deletedAt: null } },
    },
    select: {
      id: true,
      roomId: true,
      storageKey: true,
      generation: {
        select: {
          status: true,
          designStyles: { select: { designStyleId: true } },
        },
      },
    },
  });

  if (!base) {
    throw new NotFoundError("Render not found");
  }
  // Only a finished render can be edited — mid-flight or failed jobs have no
  // stable image to build on.
  if (!base.generation || base.generation.status !== "completed") {
    throw new BadRequestError("This render can't be edited yet");
  }
  // Capture into a const so the narrowing survives into the transaction closure.
  const sourceStyles = base.generation.designStyles;

  await headObject(base.storageKey).catch(() => {
    throw new BadRequestError("Render image is no longer available");
  });

  const generation = await prisma.$transaction(async (tx) => {
    const created = await tx.generation.create({
      data: {
        roomId: base.roomId,
        sourceAssetId: base.id,
        provider: imageGeneration.provider,
        modelId: imageGeneration.modelId,
        status: "pending",
        parameters: {
          edits: input.edits.map((edit) => ({
            instruction: edit.instruction,
            region: {
              x: edit.region.x,
              y: edit.region.y,
              width: edit.region.width,
              height: edit.region.height,
            },
          })),
        },
      },
      select: { id: true, status: true },
    });

    // Carry the base render's styles onto the edit so its record stays coherent
    // (and a later regenerate keeps the same look).
    if (sourceStyles.length > 0) {
      await tx.generationDesignStyle.createMany({
        data: sourceStyles.map(({ designStyleId }) => ({
          generationId: created.id,
          designStyleId,
        })),
      });
    }

    return created;
  });

  return queueGeneration(generation.id);
}
