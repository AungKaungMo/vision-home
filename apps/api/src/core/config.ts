import "dotenv/config";

import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3001")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  DEV_API_ORIGIN: optionalUrl,
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, "CLERK_PUBLISHABLE_KEY is required"),
  CLERK_WEBHOOK_SIGNING_SECRET: z
    .string()
    .min(1, "CLERK_WEBHOOK_SIGNING_SECRET is required"),
  // Optional override: left unset, the default derives from NODE_ENV below.
  // Staging runs as NODE_ENV=production but sets this true to test on fakes.
  USE_FAKE_ADAPTERS: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  FAL_KEY: optionalString,
  // SerpAPI (Google Shopping engine) — resolves detected furniture to real
  // purchasable products for "shop this look". Optional; without it the real
  // product-search adapter yields no matches.
  SERPAPI_KEY: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: optionalString,
  R2_PUBLIC_URL: optionalString,
});

const result = configSchema.safeParse({ ...process.env });

if (!result.success) {
  const issues = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid API configuration: ${issues}`);
}

export const CONFIG = Object.freeze({
  ...result.data,
  DEV_API_ORIGIN:
    result.data.DEV_API_ORIGIN?.replace(/\/$/, "") ??
    `http://localhost:${result.data.PORT}`,
  // Real providers only in production by default; dev and test fall back to
  // fakes. An explicit USE_FAKE_ADAPTERS wins — that's how staging (which runs
  // as NODE_ENV=production) opts back into fakes for testing.
  USE_FAKE_ADAPTERS:
    result.data.USE_FAKE_ADAPTERS ?? result.data.NODE_ENV !== "production",
});
