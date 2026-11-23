import { Loader2, Sparkles } from "lucide-react";

export function GenerationLoadingOverlay({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generating your room redesign"
      className="fixed inset-0 z-[100] grid place-items-center bg-canvas/95 px-6 backdrop-blur-md"
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-terracotta/10" />
          <span className="absolute inset-2 rounded-full border border-terracotta/20 bg-surface shadow-lg" />
          <span className="relative grid size-14 place-items-center rounded-full bg-terracotta-muted text-terracotta shadow-primary">
            <Sparkles aria-hidden className="size-6 animate-pulse" />
          </span>
        </div>

        <h2 className="mt-6 font-display text-2xl text-fg-1">
          Designing your room
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          We&apos;re turning your photo into a fresh new space. This usually
          takes a moment.
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-terracotta">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Generating your redesign…
        </div>
      </div>
    </div>
  );
}
