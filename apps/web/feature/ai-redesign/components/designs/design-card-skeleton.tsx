export function DesignCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="aspect-3/2 animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-1 flex justify-end border-t border-divider pt-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
