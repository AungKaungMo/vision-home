import type {
  GenerateDesignResult,
  GenerationDetail,
} from "@repo/schemas/projects";

import { api, type ApiEnvelope } from "@/lib/api/client";

export function getGeneration(id: string) {
  return api
    .get<ApiEnvelope<GenerationDetail>>(`/v1/generations/${id}`)
    .then((res) => res?.data?.data);
}

export function regenerateGeneration(id: string) {
  return api
    .post<ApiEnvelope<GenerateDesignResult>>(`/v1/generations/${id}/regenerate`)
    .then((res) => res.data.data);
}
