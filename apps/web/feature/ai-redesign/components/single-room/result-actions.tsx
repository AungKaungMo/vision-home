import { Check, Crop, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ResultActions({
  isEditing,
  onEditingChange,
  onRegenerate,
  isRegenerating,
}: {
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        type="button"
        variant={isEditing ? "default" : "outline"}
        onClick={() => onEditingChange(!isEditing)}
        className="h-10 rounded-full px-4 text-sm font-semibold shadow-sm"
      >
        {isEditing ? (
          <Check aria-hidden className="size-4" strokeWidth={2} />
        ) : (
          <Crop aria-hidden className="size-4" strokeWidth={2} />
        )}
        {isEditing ? "Done editing" : "Edit element"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onRegenerate}
        disabled={isRegenerating || isEditing}
        className="h-10 rounded-full bg-surface px-4 text-sm font-semibold shadow-sm"
      >
        <RefreshCw aria-hidden className="size-4" strokeWidth={2} />
        {isRegenerating ? "Regenerating…" : "Regenerate"}
      </Button>
    </div>
  );
}
