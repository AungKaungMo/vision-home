import { z } from "zod";

import { BadRequestError } from "@/core/errors";

const uuidSchema = z.uuid();

/**
 * Validate that a route param is a well-formed UUID before it reaches Prisma.
 * Passing a non-UUID string to a `@db.Uuid` column makes Postgres raise a
 * syntax error that surfaces as a 500, so we reject it up front as a 400.
 */
export function parseUuidParam(value: unknown, resource = "resource"): string {
  const result = uuidSchema.safeParse(value);

  if (!result.success) {
    throw new BadRequestError(`Invalid ${resource} id`);
  }

  return result.data;
}
