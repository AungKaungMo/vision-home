"use client";

import { useQuery } from "@tanstack/react-query";

import { getGeneration } from "@/feature/ai-redesign/api/generations";

const RUNNING = new Set(["pending", "queued", "processing"]);

export function useGeneration(id?: string) {
  return useQuery({
    queryKey: ["generations", id],
    queryFn: () => getGeneration(id!),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data && RUNNING.has(query.state.data.status) ? 2000 : false,
  });
}
