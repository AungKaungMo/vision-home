import type { GenerationDetail } from "@repo/schemas/projects";

import { api, type ApiEnvelope } from "@/lib/api/client";

export function getGeneration(id: string) {
  return api
    .get<ApiEnvelope<GenerationDetail>>(`/v1/generations/${id}`)
    .then((res) => res?.data?.data);
}
