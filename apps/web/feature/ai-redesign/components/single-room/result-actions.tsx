import { ChevronDown, Crop, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ResultActions({ onRegenerate }: { onRegenerate: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full bg-surface px-4 text-sm font-semibold shadow-sm"
      >
        <Crop aria-hidden className="size-4" strokeWidth={2} />
        Edit element
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onRegenerate}
        className="h-10 rounded-full bg-surface px-4 text-sm font-semibold shadow-sm"
      >
        <RefreshCw aria-hidden className="size-4" strokeWidth={2} />
        Regenerate
      </Button>

      <Button
        type="button"
        className="h-10 rounded-full px-5 text-sm font-semibold shadow-primary hover:bg-terracotta-dark"
      >
        Publish
        <ChevronDown aria-hidden className="size-4" strokeWidth={2} />
      </Button>
    </div>
  );
}
