"use client";

import { useQuery } from "@tanstack/react-query";

import { getGenerationProducts } from "@/feature/ai-redesign/api/generations";

/**
 * "Shop this look" products for a completed render. The server runs (and caches)
 * the vision pass on first request, so this is kept lazy — only enabled once a
 * generation id exists and the results view is actually showing it.
 */
export function useGenerationProducts(generationId?: string) {
  return useQuery({
    queryKey: ["generations", generationId, "products"],
    queryFn: () => getGenerationProducts(generationId!),
    enabled: Boolean(generationId),
    staleTime: Infinity,
  });
}
