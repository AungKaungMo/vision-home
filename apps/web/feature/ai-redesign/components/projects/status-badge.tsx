import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/feature/ai-redesign/constants";

const STATUS_META: Record<
  ProjectStatus,
  { label: string; dot: string; text: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-success",
    text: "text-success",
  },
  "in-progress": {
    label: "In progress",
    dot: "bg-warning",
    text: "text-warning",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface/85 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
        meta.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
