"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDesignStyles } from "@/feature/ai-redesign/api/design-styles";

export function useDesignStyles() {
  return useQuery({
    queryKey: ["design-styles"],
    queryFn: fetchDesignStyles,
  });
}
