import { applyElementEditsSchema } from "@repo/schemas/designs";

import { imageGeneration } from "@/adapters/image-generation";
import { storagePublicUrl } from "@/core/storage";
import { prisma } from "@/database/prisma";
import { persistGenerationOutput } from "@/services/asset.service";

/**
 * Run a redesign job to completion: mark it processing, ask the image provider
 * to render the source in each requested style (or apply element edits when the
 * job carries `parameters.edits`), then record the outcome. Consumed by the
 * BullMQ generation worker. Provider and persistence errors are written back to
 * the generation row as `failed`.
 */
export async function processGeneration(generationId: string): Promise<void> {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    select: {
      status: true,
      roomId: true,
      additionalDetails: true,
      parameters: true,
      sourceAsset: { select: { storageKey: true } },
      assets: {
        where: { type: "generated", deletedAt: null },
        take: 1,
        select: { id: true },
      },
      room: { select: { roomType: { select: { promptHint: true } } } },
      designStyles: {
        select: { designStyle: { select: { code: true, promptHint: true } } },
      },
    },
  });

  if (!generation) return;
  if (generation.status === "completed" || generation.status === "cancelled") {
    return;
  }
  if (generation.assets.length > 0) {
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: "completed", completedAt: new Date() },
    });
    return;
  }

  await prisma.generation.update({
    where: { id: generationId },
    data: { status: "processing", startedAt: new Date() },
  });

  try {
    const sourceImageUrl = storagePublicUrl(generation.sourceAsset.storageKey);
    if (!sourceImageUrl) {
      throw new Error(
        "Source asset has no public URL (is storage configured?)",
      );
    }

    const roomTypeHint = generation.room.roomType?.promptHint ?? null;
    // An element-edit job carries `parameters.edits` and runs against the base
    // render (its source asset) rather than rendering styles from scratch.
    const edit = applyElementEditsSchema.safeParse(generation.parameters);

    const result = edit.success
      ? await imageGeneration.edit({
          baseImageUrl: sourceImageUrl,
          edits: edit.data.edits,
          roomTypeHint,
        })
      : await imageGeneration.submit({
          sourceImageUrl,
          styles: generation.designStyles.map(({ designStyle }) => ({
            code: designStyle.code,
            promptHint: designStyle.promptHint,
          })),
          details: generation.additionalDetails,
          roomTypeHint,
        });

    await persistGenerationOutput(
      generation.roomId,
      generationId,
      result.image,
    );

    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: "completed",
        providerRequestId: result.providerRequestId,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    const failure =
      error instanceof Error ? error : new Error("Generation failed");

    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: "failed",
        errorMessage: failure.message,
        completedAt: new Date(),
      },
    });

    throw failure;
  }
}
