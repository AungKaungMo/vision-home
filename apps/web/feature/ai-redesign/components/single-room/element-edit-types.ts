import type { ElementEditRegion } from "@repo/schemas/designs";

export type NormalizedEditRegion = ElementEditRegion;

/**
 * An edit as the canvas tracks it — the shared contract's `instruction` + region
 * plus a client-only `id` for selection and React keys (stripped before send).
 */
export type ElementEdit = {
  id: string;
  instruction: string;
  region: NormalizedEditRegion;
};
