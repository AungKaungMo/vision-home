import type { RequestHandler } from "express";

import {
  ClerkWebhookConfigurationError,
  verifyClerkWebhook,
  type WebhookEvent,
} from "@/adapters/clerk/clerk-webhook.adapter";
import { AppError, UnauthorizedError } from "@/core/errors";
import { processClerkWebhook } from "@/services/clerk-webhook.service";

export const handleClerkWebhook: RequestHandler = async (request, response) => {
  let event: WebhookEvent;

  try {
    event = await verifyClerkWebhook(request);
  } catch (error) {
    if (error instanceof ClerkWebhookConfigurationError) {
      throw new AppError(500, "Webhook signing secret is not configured");
    }

    throw new UnauthorizedError("Invalid webhook signature");
  }

  await processClerkWebhook(event);

  response.status(200).json({ received: true });
};
