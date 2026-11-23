import { Worker } from "bullmq";

import { logger } from "@/core/logger";
import { prisma } from "@/database/prisma";
import {
  GENERATION_QUEUE_NAME,
  type GenerationJobData,
} from "@/queues/generation.constants";
import { createRedisConnection } from "@/queues/redis.connection";
import { processGeneration } from "@/workers/processors/redesign.processor";

const connection = createRedisConnection(null);
const worker = new Worker<GenerationJobData>(
  GENERATION_QUEUE_NAME,
  async (job) => {
    logger.info("Processing generation job", {
      jobId: job.id,
      generationId: job.data.generationId,
    });
    await processGeneration(job.data.generationId);
  },
  { connection, concurrency: 1 },
);

worker.on("ready", () => {
  logger.info("Generation worker ready", { queue: GENERATION_QUEUE_NAME });
});

worker.on("completed", (job) => {
  logger.info("Generation job processed", {
    jobId: job.id,
    generationId: job.data.generationId,
  });
});

worker.on("failed", (job, error) => {
  logger.error("Generation job failed", {
    jobId: job?.id,
    generationId: job?.data.generationId,
    error: error.message,
  });

  if (job) {
    void prisma.generation
      .updateMany({
        where: {
          id: job.data.generationId,
          status: { in: ["pending", "queued", "processing"] },
        },
        data: {
          status: "failed",
          errorMessage: error.message,
          completedAt: new Date(),
        },
      })
      .catch((updateError) => {
        logger.error("Failed to persist generation job failure", {
          generationId: job.data.generationId,
          error:
            updateError instanceof Error
              ? updateError.message
              : String(updateError),
        });
      });
  }
});

worker.on("stalled", (jobId) => {
  logger.warn("Generation job stalled", { jobId });
});

worker.on("error", (error) => {
  logger.error("Generation worker error", { error: error.message });
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("Shutting down generation worker", { signal });

  try {
    await worker.close();
    await connection.quit();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Generation worker shutdown failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
