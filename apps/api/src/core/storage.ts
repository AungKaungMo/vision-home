import { CONFIG } from "@/core/config";

/**
 * Build a public R2 URL from an object key (such as a room type's
 * `defaultImageKey`). Returns `null` when either the key or the configured
 * public base URL is missing, so callers can fall back gracefully.
 */
export function r2PublicUrl(key: string | null | undefined): string | null {
  const base = CONFIG.R2_PUBLIC_URL;
  if (!key || !base) return null;

  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}
