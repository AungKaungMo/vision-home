import cors from "cors";
import express from "express";

import { errorMiddleware } from "@/api/middleware/error.middleware";
import { v1Router } from "@/api/v1/router";
import { webhooksRouter } from "@/api/v1/webhooks/webhooks.router";
import { CONFIG } from "@/core/config";

export const app = express();

// Allow the browser web app to call the API cross-origin. Handles preflight
// (OPTIONS) automatically for every route below.
app.use(
  cors({
    origin: CONFIG.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Clerk webhooks require the raw request body for Svix signature
// verification, so they must be mounted before express.json() consumes
app.use("/api/v1/webhooks", webhooksRouter);

app.use(express.json());
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
