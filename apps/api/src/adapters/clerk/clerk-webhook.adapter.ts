import type { Request } from "express";
import { verifyWebhook, type WebhookEvent } from "@clerk/express/webhooks";

import { CONFIG } from "@/core/config";

export class ClerkWebhookConfigurationError extends Error {
  constructor() {
    super("CLERK_WEBHOOK_SIGNING_SECRET is not configured");
    this.name = "ClerkWebhookConfigurationError";
  }
}

export async function verifyClerkWebhook(
  request: Request,
): Promise<WebhookEvent> {
  const signingSecret = CONFIG.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    throw new ClerkWebhookConfigurationError();
  }

  return verifyWebhook(request, { signingSecret });
}

export type { WebhookEvent };
