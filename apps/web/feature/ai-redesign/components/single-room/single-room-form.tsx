"use client";

import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GenerationLoadingOverlay } from "@/feature/ai-redesign/components/single-room/generation-loading-overlay";
import { PhotoUpload } from "@/feature/ai-redesign/components/single-room/photo-upload";
import { RedesignResults } from "@/feature/ai-redesign/components/single-room/redesign-results";
import { RoomTypePicker } from "@/feature/ai-redesign/components/single-room/room-type-picker";
import { StylePicker } from "@/feature/ai-redesign/components/single-room/style-picker";
import { useSingleRoomForm } from "@/feature/ai-redesign/hooks/single-room/use-single-room-form";

export function SingleRoomForm({
  projectId,
}: {
  projectId?: string;
} = {}) {
  const {
    roomTypeId,
    source,
    onSourceChange,
    styles,
    setStyles,
    details,
    setDetails,
    canGenerate,
    isGenerating,
    generate,
    generationId,
    isProjectLoading,
    resetGeneration,
  } = useSingleRoomForm(projectId);

  if (isProjectLoading) {
    return (
      <div className="grid aspect-4/3 place-items-center rounded-2xl border border-border bg-muted md:aspect-16/9">
        <Loader2 className="size-6 animate-spin text-fg-3" aria-hidden />
      </div>
    );
  }

  if (generationId) {
    return (
      <RedesignResults
        generationId={generationId}
        onStartOver={resetGeneration}
      />
    );
  }

  return (
    <>
      <GenerationLoadingOverlay open={isGenerating} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <PhotoUpload value={source} onChange={onSourceChange} />
          <RoomTypePicker
            roomTypeId={roomTypeId}
            value={source}
            onChange={onSourceChange}
          />
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
          <StylePicker value={styles} onChange={setStyles} />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="single-room-details"
              className="flex items-baseline gap-1.5 text-sm font-medium text-fg-1"
            >
              Additional details
              <span className="text-xs font-normal text-fg-3">optional</span>
            </label>
            <textarea
              id="single-room-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={3}
              placeholder={
                'Tell the AI anything specific — e.g. "keep the wooden floor, add plants".'
              }
              className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm outline-none transition-[color,box-shadow] placeholder:text-fg-3 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-surface-warm px-3.5 py-3 text-sm text-fg-2">
            <Sparkles
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-terracotta"
              strokeWidth={2}
            />
            <p className="leading-snug">
              Blending styles? The AI weighs them evenly across layered textiles
              and finishes.
            </p>
          </div>

          <Button
            size="lg"
            disabled={!canGenerate || isGenerating}
            onClick={generate}
            className="w-full shadow-primary"
          >
            <Wand2 aria-hidden strokeWidth={2.25} />
            {isGenerating ? "Generating…" : "Generate redesign"}
          </Button>

          {!canGenerate && (
            <p className="-mt-3 text-center text-xs text-fg-3">
              Upload a photo or pick a sample room to start.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
