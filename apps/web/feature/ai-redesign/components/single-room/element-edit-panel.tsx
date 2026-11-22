"use client";

import { Loader2, Sparkles, Trash2, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ElementEdit } from "@/feature/ai-redesign/components/single-room/element-edit-types";
import { cn } from "@/lib/utils";

export function ElementEditPanel({
  edits,
  activeEditId,
  canApply,
  isApplying,
  onSelect,
  onInstructionChange,
  onRemove,
  onApply,
}: {
  edits: ElementEdit[];
  activeEditId: string | null;
  canApply: boolean;
  isApplying: boolean;
  onSelect: (id: string) => void;
  onInstructionChange: (id: string, instruction: string) => void;
  onRemove: (id: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      {edits.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-surface-warm px-4 py-3 text-sm text-fg-2">
          <Sparkles aria-hidden className="size-4 shrink-0 text-terracotta" />
          Drag over the image to mark the element you want to change.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {edits.map((edit, index) => {
            const active = edit.id === activeEditId;

            return (
              <div
                key={edit.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2 transition-colors",
                  active
                    ? "border-terracotta bg-terracotta-muted/50"
                    : "border-border bg-surface",
                )}
                onClick={() => onSelect(edit.id)}
              >
                <label
                  htmlFor={`element-edit-${edit.id}`}
                  className="flex shrink-0 items-center gap-1.5 px-1 text-sm font-semibold text-terracotta"
                >
                  <WandSparkles aria-hidden className="size-4" />#{index + 1}
                </label>
                <Input
                  id={`element-edit-${edit.id}`}
                  value={edit.instruction}
                  onFocus={() => onSelect(edit.id)}
                  onChange={(event) =>
                    onInstructionChange(edit.id, event.target.value)
                  }
                  placeholder="What should change in this area?"
                  className="h-11 rounded-xl bg-surface px-3 shadow-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove edit ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(edit.id);
                  }}
                  className="size-10 rounded-full text-fg-3 hover:text-terracotta"
                >
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-fg-3">
          {edits.length === 0
            ? "Draw a box to add your first edit."
            : `${edits.length} ${edits.length === 1 ? "change" : "changes"} ready · draw more boxes to add`}
        </p>
        <Button
          type="button"
          disabled={!canApply || isApplying}
          onClick={onApply}
          className="h-11 rounded-full px-5 font-semibold shadow-primary hover:bg-terracotta-dark"
        >
          {isApplying ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <WandSparkles aria-hidden className="size-4" />
          )}
          {isApplying
            ? "Applying…"
            : `Apply ${edits.length || ""} ${edits.length === 1 ? "edit" : "edits"}`}
        </Button>
      </div>
    </div>
  );
}
