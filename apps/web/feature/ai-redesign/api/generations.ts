import type {
  ApplyElementEditsInput,
  GenerateDesignResult,
  GenerationDetail,
} from "@repo/schemas/designs";

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

export function applyElementEdits(
  baseAssetId: string,
  input: ApplyElementEditsInput,
) {
  return api
    .post<ApiEnvelope<GenerateDesignResult>>(
      `/v1/assets/${baseAssetId}/edits`,
      input,
    )
    .then((res) => res.data.data);
}
