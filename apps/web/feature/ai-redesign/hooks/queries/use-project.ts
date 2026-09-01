"use client";

import { useQuery } from "@tanstack/react-query";

import { getProject } from "@/feature/ai-redesign/api/projects";

export function useProject(id?: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProject(id!),
    enabled: Boolean(id),
  });
}