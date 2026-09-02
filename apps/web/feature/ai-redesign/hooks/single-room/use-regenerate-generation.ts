"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { regenerateGeneration } from "@/feature/ai-redesign/api/generations";

export function useRegenerateGeneration(
  onRegenerated: (generationId: string) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: regenerateGeneration,
    onSuccess: (result) => {
      onRegenerated(result.generationId);
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => toast.error("Something went wrong"),
  });
}
