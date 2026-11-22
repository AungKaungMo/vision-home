"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DesignListItem } from "@repo/schemas/designs";

import {
  deleteDesign,
  restoreDesign,
  setDesignFavorite,
  trashDesign,
} from "@/feature/ai-redesign/api/designs";
import { designsQueryKey } from "@/feature/ai-redesign/hooks/queries/use-designs";

type DesignList = { items: DesignListItem[] };

/**
 * Toggling a favorite is the one high-frequency action in the gallery, so it
 * updates the cached list optimistically and only reconciles with the server
 * on error — the heart fills the instant it's clicked.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      setDesignFavorite(id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: designsQueryKey });
      const previous = queryClient.getQueryData<DesignList>(designsQueryKey);

      queryClient.setQueryData<DesignList>(designsQueryKey, (current) =>
        current
          ? {
              items: current.items.map((design) =>
                design.id === id ? { ...design, isFavorite } : design,
              ),
            }
          : current,
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(designsQueryKey, context.previous);
      }
      toast.error("Couldn't update favorite. Please try again.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: designsQueryKey });
    },
  });
}

export function useTrashDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trashDesign(id),
    onSuccess: () => toast.success("Design moved to trash."),
    onError: () => toast.error("Couldn't move the design to trash."),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: designsQueryKey });
    },
  });
}

export function useRestoreDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreDesign(id),
    onSuccess: () => toast.success("Design restored."),
    onError: () => toast.error("Couldn't restore the design."),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: designsQueryKey });
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDesign(id),
    onSuccess: () => toast.success("Design deleted permanently."),
    onError: () => toast.error("Couldn't delete the design."),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: designsQueryKey });
    },
  });
}
