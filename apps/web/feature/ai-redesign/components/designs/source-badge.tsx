import { Pencil, Sparkles } from "lucide-react";
import type { DesignSource } from "@repo/schemas/designs";

import { cn } from "@/lib/utils";
import { DESIGN_SOURCE_META } from "@/feature/ai-redesign/constants";

const SOURCE_ICON: Record<DesignSource, typeof Sparkles> = {
  generated: Sparkles,
  edited: Pencil,
};

export function SourceBadge({
  source,
  className,
}: {
  source: DesignSource;
  className?: string;
}) {
  const Icon = SOURCE_ICON[source];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface/85 px-2.5 py-1 text-xs font-semibold text-fg-2 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
      {DESIGN_SOURCE_META[source].label}
    </span>
  );
}
