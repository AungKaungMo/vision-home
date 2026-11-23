"use client";

import { useQuery } from "@tanstack/react-query";

import { getDesign } from "@/feature/ai-redesign/api/designs";

export function useDesign(id?: string) {
  return useQuery({
    queryKey: ["designs", id],
    queryFn: () => getDesign(id!),
    enabled: Boolean(id),
  });
}
