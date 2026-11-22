"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BeforeAfterComparison } from "@/feature/ai-redesign/components/single-room/before-after-comparison";
import { ElementEditor } from "@/feature/ai-redesign/components/single-room/element-editor";
import { GenerationLoadingOverlay } from "@/feature/ai-redesign/components/single-room/generation-loading-overlay";
import { ShopThisLook } from "@/feature/ai-redesign/components/single-room/shop-this-look";
import { useGeneration } from "@/feature/ai-redesign/hooks/queries/use-generation";

export function RedesignResults({
  generationId,
  isEditing,
  hasOpenedEditor,
  isRegenerating,
  onEditApplied,
}: {
  generationId: string;
  isEditing: boolean;
  hasOpenedEditor: boolean;
  isRegenerating: boolean;
  onEditApplied: (generationId: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useGeneration(generationId);

  const status = data?.status;
  const isRunning =
    status === "pending" || status === "queued" || status === "processing";
  const output = data?.outputs.at(-1);

  useEffect(() => {
    if (status === "completed") {
      void queryClient.invalidateQueries({ queryKey: ["designs"] });
    }
  }, [queryClient, status]);

  return (
    <>
      <GenerationLoadingOverlay open={isLoading || isRunning || isRegenerating} />

      <div className="flex flex-col gap-6">
        {isLoading || isRunning ? null : isError || !data ? (
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-warm px-4 py-3.5 text-sm text-fg-2">
            <span>Couldn&apos;t load this redesign.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="font-semibold text-terracotta transition-colors duration-fast hover:text-terracotta-dark"
            >
              Retry
            </button>
          </div>
        ) : status === "failed" ? (
          <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface-warm px-4 py-3.5 text-sm text-fg-2">
            <AlertTriangle
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-terracotta"
            />
            <p className="leading-snug">
              {data.errorMessage || "Something went wrong."}
            </p>
          </div>
        ) : status === "cancelled" ? (
          <p className="text-sm text-fg-3">This redesign was cancelled.</p>
        ) : !output ? (
          <p className="text-sm text-fg-3">
            No render was produced for this redesign.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {hasOpenedEditor && (
              <div className={isEditing ? "w-full lg:w-9/12" : "hidden"}>
                <ElementEditor
                  key={output.id}
                  baseAssetId={output.id}
                  imageUrl={output.imageUrl}
                  onApplied={onEditApplied}
                />
              </div>
            )}
            {!isEditing && (
              <>
                <div className="w-full lg:w-9/12">
                  <BeforeAfterComparison
                    beforeUrl={data.sourceImageUrl}
                    afterUrl={output.imageUrl}
                  />
                </div>
                <ShopThisLook />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
