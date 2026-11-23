import type {
  CreateDesignInput,
  DesignDetail,
  DesignListItem,
  GenerateDesignInput,
  GenerateDesignResult,
  SourceUploadResponse,
} from "@repo/schemas/designs";

import { api, type ApiEnvelope } from "@/lib/api/client";

export function getDesigns() {
  return api
    .get<ApiEnvelope<{ items: DesignListItem[] }>>("/v1/designs")
    .then((res) => res?.data?.data);
}

export function createDesign(input: CreateDesignInput) {
  return api
    .post<ApiEnvelope<DesignDetail>>("/v1/designs", input)
    .then((res) => res?.data?.data);
}

export function getDesign(id: string) {
  return api
    .get<ApiEnvelope<DesignDetail>>(`/v1/designs/${id}`)
    .then((res) => res?.data?.data);
}

export function setDesignFavorite(id: string, isFavorite: boolean) {
  const request = isFavorite
    ? api.put(`/v1/designs/${id}/favorite`)
    : api.delete(`/v1/designs/${id}/favorite`);
  return request.then(() => undefined);
}

export function trashDesign(id: string) {
  return api.post(`/v1/designs/${id}/trash`).then(() => undefined);
}

export function restoreDesign(id: string) {
  return api.post(`/v1/designs/${id}/restore`).then(() => undefined);
}

export function deleteDesign(id: string) {
  return api.delete(`/v1/designs/${id}`).then(() => undefined);
}

export function uploadSourceImage(designId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post<
      ApiEnvelope<SourceUploadResponse>
    >(`/v1/designs/${designId}/assets/upload`, formData)
    .then((res) => res.data.data);
}

export function generateDesign(id: string, input: GenerateDesignInput) {
  return api
    .post<
      ApiEnvelope<GenerateDesignResult>
    >(`/v1/designs/${id}/generate`, input)
    .then((res) => res.data.data);
}
