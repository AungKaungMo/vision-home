import assert from "node:assert/strict";
import test from "node:test";

import {
  getDeletedUserValues,
  mapClerkUser,
} from "../src/adapters/clerk/clerk-user.adapter.js";

type ClerkUser = Parameters<typeof mapClerkUser>[0];

function createClerkUser(overrides: Partial<ClerkUser> = {}): ClerkUser {
  return {
    id: "user_2abc12345678",
    username: null,
    first_name: "Vision",
    last_name: "User",
    image_url: "https://img.example/avatar.png",
    primary_email_address_id: "email_primary",
    email_addresses: [
      {
        id: "email_secondary",
        email_address: "secondary@example.com",
      },
      {
        id: "email_primary",
        email_address: "PRIMARY@EXAMPLE.COM",
      },
    ],
    ...overrides,
  } as ClerkUser;
}

test("maps the Clerk primary email and profile fields", () => {
  const user = mapClerkUser(createClerkUser({ username: "vision-user" }));

  assert.deepEqual(user, {
    clerkId: "user_2abc12345678",
    email: "primary@example.com",
    username: "vision-user",
    fullName: "Vision User",
    avatarUrl: "https://img.example/avatar.png",
  });
});

test("creates a stable fallback username when Clerk has no username", () => {
  const user = mapClerkUser(createClerkUser());

  assert.equal(user.username, "primary-12345678");
  assert.ok(user.username.length <= 30);
});

test("anonymizes deleted users while retaining a soft-delete marker", () => {
  const deletedUser = getDeletedUserValues("user_2abc12345678");

  assert.equal(deletedUser.username, "deleted-2abc12345678");
  assert.equal(deletedUser.fullName, null);
  assert.equal(deletedUser.avatarUrl, null);
  assert.ok(deletedUser.deletedAt instanceof Date);
});
