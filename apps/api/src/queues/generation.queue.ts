import { Queue } from "bullmq";

import { logger } from "@/core/logger";
import {
  GENERATION_JOB_NAME,
  GENERATION_QUEUE_NAME,
  type GenerationJobData,
} from "@/queues/generation.constants";
import { createRedisConnection } from "@/queues/redis.connection";

const connection = createRedisConnection(1);

const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { age: 24 * 60 * 60, count: 1_000 },
    removeOnFail: { age: 7 * 24 * 60 * 60, count: 1_000 },
  },
});

generationQueue.on("error", (error) => {
  logger.error("Generation queue error", { error: error.message });
});

export async function enqueueGeneration(generationId: string): Promise<void> {
  await generationQueue.add(
    GENERATION_JOB_NAME,
    { generationId },
    { jobId: generationId },
  );
}

export async function closeGenerationQueue(): Promise<void> {
  await generationQueue.close();
  await connection.quit();
}
