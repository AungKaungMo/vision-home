import type { DesignStyle } from "@repo/schemas/design-styles";

import { api, type ApiEnvelope } from "@/lib/api/client";

export function fetchDesignStyles() {
  return api
    .get<ApiEnvelope<{ items: DesignStyle[] }>>("/v1/design-styles")
    .then((res) => res?.data?.data);
}
