import type {
  CreateProjectInput,
  GenerateDesignInput,
  GenerateDesignResult,
  ProjectDetail,
  ProjectListItem,
  SourceUploadResponse,
} from "@repo/schemas/projects";

import { api, type ApiEnvelope } from "@/lib/api/client";

export function getProjects() {
  return api
    .get<ApiEnvelope<{ items: ProjectListItem[] }>>("/v1/projects")
    .then((res) => res?.data?.data);
}

export function createProject(input: CreateProjectInput) {
  return api
    .post<ApiEnvelope<ProjectDetail>>("/v1/projects", input)
    .then((res) => res?.data?.data);
}

export function getProject(id: string) {
  return api
    .get<ApiEnvelope<ProjectDetail>>(`/v1/projects/${id}`)
    .then((res) => res?.data?.data);
}

export function uploadSourceImage(projectId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post<
      ApiEnvelope<SourceUploadResponse>
    >(`/v1/projects/${projectId}/assets/upload`, formData)
    .then((res) => res.data.data);
}

export function generateDesign(id: string, input: GenerateDesignInput) {
  return api
    .post<
      ApiEnvelope<GenerateDesignResult>
    >(`/v1/projects/${id}/generate`, input)
    .then((res) => res.data.data);
}
