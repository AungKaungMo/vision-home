"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApplyElementEditsInput } from "@repo/schemas/designs";

import { applyElementEdits } from "@/feature/ai-redesign/api/generations";

export function useApplyElementEdits(
  onApplied: (generationId: string) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      baseAssetId,
      input,
    }: {
      baseAssetId: string;
      input: ApplyElementEditsInput;
    }) => applyElementEdits(baseAssetId, input),
    onSuccess: (result) => {
      onApplied(result.generationId);
      void queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: () => toast.error("Something went wrong"),
  });
}
