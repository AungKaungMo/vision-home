import { z } from "zod";

import { BadRequestError } from "@/core/errors";

const uuidSchema = z.uuid();

export function parseUuidParam(value: unknown, resource = "resource"): string {
  const result = uuidSchema.safeParse(value);

  if (!result.success) {
    throw new BadRequestError(`Invalid ${resource} id`);
  }

  return result.data;
}

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request body";
    throw new BadRequestError(message);
  }

  return result.data;
}
