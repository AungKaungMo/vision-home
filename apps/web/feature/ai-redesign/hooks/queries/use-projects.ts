"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/feature/ai-redesign/api/projects";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
}
