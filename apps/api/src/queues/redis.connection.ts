import IORedis from "ioredis";

import { CONFIG } from "@/core/config";

export function createRedisConnection(maxRetriesPerRequest: number | null) {
  return new IORedis(CONFIG.REDIS_URL, { maxRetriesPerRequest });
}
