import type { WebhookEvent } from "@/adapters/clerk/clerk-webhook.adapter";
import {
  getDeletedUserValues,
  mapClerkUser,
} from "@/adapters/clerk/clerk-user.adapter";
import { logger } from "@/core/logger";
import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function processClerkWebhook(event: WebhookEvent) {
  try {
    await routeClerkWebhook(event);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      logger.warn("Clerk webhook applied concurrently; treating as processed", {
        type: event.type,
        target: String(error.meta?.target ?? "unknown"),
      });
      return;
    }

    throw error;
  }
}

async function routeClerkWebhook(event: WebhookEvent) {
  switch (event.type) {
    case "user.created": {
      const user = mapClerkUser(event.data);

      await prisma.user.upsert({
        where: { clerkId: user.clerkId },
        create: user,
        update: {
          ...user,
          deletedAt: null,
        },
      });
      break;
    }

    case "user.updated": {
      const user = mapClerkUser(event.data);

      await prisma.user.upsert({
        where: { clerkId: user.clerkId },
        create: user,
        update: {
          ...user,
          deletedAt: null,
        },
      });
      break;
    }

    case "user.deleted": {
      if (!event.data.id) {
        throw new Error("The Clerk user.deleted event is missing a user ID");
      }

      await prisma.user.updateMany({
        where: { clerkId: event.data.id },
        data: getDeletedUserValues(event.data.id),
      });
      break;
    }

    default:
      break;
  }
}
