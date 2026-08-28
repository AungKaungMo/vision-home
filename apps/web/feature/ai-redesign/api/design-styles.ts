import { api, type ApiEnvelope } from "@/lib/api/client";

export type DesignStyle = {
  id: string;
  code: string;
  name: string;
  promptHint: string | null;
};

/** GET /api/v1/design-styles — returns the full (small) set, unpaginated. */
export function fetchDesignStyles() {
  return api
    .get<ApiEnvelope<{ items: DesignStyle[] }>>("/v1/design-styles")
    .then((res) => res.data.data);
}
