import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PROJECT_TYPE_META,
  WORKFLOW_OPTIONS,
  type ProjectType,
} from "@/feature/ai-redesign/constants";

export function CreateProjectShell({
  type,
  children,
  /** Widen the container for form-heavy flows (e.g. single-room's 2-col grid). */
  wide = false,
}: {
  type: ProjectType;
  children?: React.ReactNode;
  wide?: boolean;
}) {
  const meta = PROJECT_TYPE_META[type];
  const option = WORKFLOW_OPTIONS.find((item) => item.type === type);
  if (!meta || !option) notFound();
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8",
        wide ? "max-w-5xl" : "max-w-3xl",
      )}
    >
      <div className="flex flex-col gap-4">
        <Link
          href="/ai-redesign"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-fg-2 transition-colors duration-fast hover:text-fg-1"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
          Back to projects
        </Link>

        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-terracotta-muted text-terracotta">
            <Icon aria-hidden className="size-5" strokeWidth={2} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
              New project
            </span>
            <h1 className="font-display text-2xl text-fg-1">{option.title}</h1>
          </div>
        </div>

        <p className="max-w-2xl text-md leading-relaxed text-fg-2">
          {option.description}
        </p>
      </div>

      {children ?? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border-strong bg-surface-warm px-6 py-16 text-center">
          <p className="text-sm font-medium text-fg-2">
            Create form coming next.
          </p>
          <p className="mt-1 text-sm text-fg-3">
            The single-page {option.title.toLowerCase()} form will be built here.
          </p>
        </div>
      )}
    </div>
  );
}
