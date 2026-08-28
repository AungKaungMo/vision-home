import { app } from "@/app";
import { CONFIG } from "@/core/config";
import { logger } from "@/core/logger";
import { prisma } from "@/database/prisma";

const server = app.listen(CONFIG.PORT, () => {
  logger.info("VisionHome API listening", {
    url: `http://localhost:${CONFIG.PORT}`,
    env: CONFIG.NODE_ENV,
  });
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("Shutting down", { signal });

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));