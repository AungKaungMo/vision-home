import type { GenerateDesignResult } from "@repo/schemas/designs";

import { ServiceUnavailableError } from "@/core/errors";
import { logger } from "@/core/logger";
import { prisma } from "@/database/prisma";
import { enqueueGeneration } from "@/queues/generation.queue";

export async function queueGeneration(
  generationId: string,
): Promise<GenerateDesignResult> {
  try {
    await enqueueGeneration(generationId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown generation queue error";

    await prisma.generation.updateMany({
      where: { id: generationId, status: "pending" },
      data: {
        status: "failed",
        errorMessage: "Generation couldn't be queued",
        completedAt: new Date(),
      },
    });
    logger.error("Failed to queue generation", {
      generationId,
      error: message,
    });
    throw new ServiceUnavailableError("Generation queue is unavailable");
  }

  await prisma.generation.updateMany({
    where: { id: generationId, status: "pending" },
    data: { status: "queued" },
  });

  return { generationId, status: "queued" };
}
