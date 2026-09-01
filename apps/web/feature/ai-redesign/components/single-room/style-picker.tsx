"use client";

import { cn } from "@/lib/utils";
import { useDesignStyles } from "@/feature/ai-redesign/hooks/queries/use-design-styles";

export const MAX_STYLES = 3;

export function StylePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const { data, isLoading, isError, refetch } = useDesignStyles();

  const styles = data?.items ?? [];
  const atLimit = value.length >= MAX_STYLES;

  function toggle(code: string) {
    if (value.includes(code)) {
      onChange(value.filter((item) => item !== code));
    } else if (!atLimit) {
      onChange([...value, code]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-fg-1">Pick your style</h2>
        <span className="text-xs font-medium text-fg-3">
          {value.length}/{MAX_STYLES} selected
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-warm px-3.5 py-3 text-sm text-fg-2">
          <span>Couldn&apos;t load styles.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold text-terracotta transition-colors duration-fast hover:text-terracotta-dark"
          >
            Retry
          </button>
        </div>
      ) : styles.length === 0 ? (
        <p className="text-sm text-fg-3">No styles available.</p>
      ) : (
        <div
          role="group"
          aria-label="Redesign style"
          className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto"
        >
          {styles.map((style) => {
            const active = value.includes(style.code);
            const disabled = !active && atLimit;

            return (
              <button
                key={style.id}
                type="button"
                role="checkbox"
                aria-checked={active}
                disabled={disabled}
                onClick={() => toggle(style.code)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors duration-fast",
                  active
                    ? "border-terracotta bg-terracotta-muted text-fg-1"
                    : "border-border bg-surface text-fg-2 hover:border-terracotta-light hover:text-fg-1",
                  disabled &&
                    "cursor-not-allowed opacity-40 hover:border-border hover:text-fg-2",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full border-2 transition-colors duration-fast",
                    active ? "border-terracotta" : "border-border-strong",
                  )}
                >
                  {active && (
                    <span className="size-2 rounded-full bg-terracotta" />
                  )}
                </span>
                {style.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
