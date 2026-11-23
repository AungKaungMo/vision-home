"use client";

import { useQuery } from "@tanstack/react-query";

import { getDesigns } from "@/feature/ai-redesign/api/designs";

export const designsQueryKey = ["designs"] as const;

export function useDesigns() {
  return useQuery({
    queryKey: designsQueryKey,
    queryFn: getDesigns,
  });
}
