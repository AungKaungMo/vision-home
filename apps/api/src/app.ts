import { fileURLToPath } from "node:url";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";

import { errorMiddleware } from "@/api/middleware/error.middleware";
import { devStorageRouter } from "@/api/v1/dev-storage/dev-storage.router";
import { v1Router } from "@/api/v1/router";
import { webhooksRouter } from "@/api/v1/webhooks/webhooks.router";
import { CONFIG } from "@/core/config";

export const app = express();

app.use(
  cors({
    origin: CONFIG.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Clerk signature verification requires the raw body before express.json().
app.use("/api/v1/webhooks", webhooksRouter);

if (CONFIG.USE_FAKE_ADAPTERS) {
  const assetDirectory = fileURLToPath(new URL("../asset", import.meta.url));
  app.use("/asset", express.static(assetDirectory));
  app.use("/api/v1/dev-storage", devStorageRouter);
}

app.use(express.json());

app.use(clerkMiddleware());
app.use("/api/v1", v1Router);

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "vision-home-api",
    timestamp: new Date().toISOString(),
  });
});

// Registered last so it catches errors forwarded from any route above.
app.use(errorMiddleware);
