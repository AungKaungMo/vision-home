import { raw, Router } from "express";

import { handleClerkWebhook } from "@/api/v1/webhooks/webhooks.handler";

export const webhooksRouter = Router();

webhooksRouter.post(
  "/clerk",
  raw({ type: "application/json" }),
  handleClerkWebhook,
);
