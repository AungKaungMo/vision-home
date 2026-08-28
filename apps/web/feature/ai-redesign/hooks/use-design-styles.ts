"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDesignStyles } from "@/feature/ai-redesign/api/design-styles";

/** All design styles from /api/v1/design-styles (small, unpaginated set). */
export function useDesignStyles() {
  return useQuery({
    queryKey: ["design-styles"],
    queryFn: fetchDesignStyles,
  });
}
