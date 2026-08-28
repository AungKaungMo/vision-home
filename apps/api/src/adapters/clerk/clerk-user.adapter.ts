import type { WebhookEvent } from "@clerk/express/webhooks";

import { BadRequestError } from "@/core/errors";

type ClerkUser = Extract<
  WebhookEvent,
  { type: "user.created" | "user.updated" }
>["data"];

function getPrimaryEmail(user: ClerkUser): string {
  const primaryEmail = user.email_addresses.find(
    ({ id }) => id === user.primary_email_address_id,
  );
  const email =
    primaryEmail?.email_address ?? user.email_addresses[0]?.email_address;

  if (!email) {
    throw new BadRequestError(
      `Clerk user ${user.id} does not have an email address`,
    );
  }

  return email.trim().toLowerCase();
}

function getFallbackUsername(clerkId: string, email: string): string {
  const suffix = clerkId
    .replace(/^user_/, "")
    .slice(-8)
    .toLowerCase();
  const emailPrefix = email.split("@")[0] ?? "user";
  const sanitizedPrefix = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  const prefix = sanitizedPrefix.length >= 3 ? sanitizedPrefix : "user";

  return `${prefix.slice(0, 21)}-${suffix}`;
}

export function mapClerkUser(user: ClerkUser) {
  const email = getPrimaryEmail(user);
  const fullName = [user.first_name, user.last_name]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(" ")
    .trim();
  const clerkUsername = user.username?.trim();

  return {
    clerkId: user.id,
    email,
    username:
      clerkUsername && clerkUsername.length >= 3
        ? clerkUsername.slice(0, 30)
        : getFallbackUsername(user.id, email),
    fullName: fullName ? fullName.slice(0, 120) : null,
    avatarUrl: user.image_url || null,
  };
}

export function getDeletedUserValues(clerkId: string) {
  const suffix = clerkId
    .replace(/^user_/, "")
    .slice(-20)
    .toLowerCase();

  return {
    email: `deleted+${clerkId}@invalid.local`,
    username: `deleted-${suffix}`.slice(0, 30),
    fullName: null,
    avatarUrl: null,
    bio: null,
    deletedAt: new Date(),
  };
}
