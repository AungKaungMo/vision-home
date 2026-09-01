"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PROJECT_TYPE_META,
  WORKFLOW_OPTIONS,
} from "@/feature/ai-redesign/constants";
import type { ProjectType } from "@repo/schemas/projects";

import { useProject } from "@/feature/ai-redesign/hooks/queries/use-project";

export function CreateProjectShell({
  type,
  children,
  wide = false,
  projectId,
}: {
  type: ProjectType;
  children?: React.ReactNode;
  wide?: boolean;
  projectId?: string;
}) {
  const meta = PROJECT_TYPE_META[type];
  const option = WORKFLOW_OPTIONS.find((item) => item.type === type);
  if (!meta || !option) notFound();
  const Icon = meta.icon;

  const { data: project, isLoading } = useProject(projectId);

  const loading = Boolean(projectId) && isLoading;
  const heading = project?.title || option.title;
  const blurb = project?.description || "";
  const eyebrow = project ? option.title : "New project";

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
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
              {eyebrow}
            </span>
            {loading ? (
              <div className="h-7 w-56 animate-pulse rounded bg-muted" />
            ) : (
              <h1 className="font-display text-2xl text-fg-1">{heading}</h1>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
        ) : (
          <p className="max-w-2xl text-md leading-relaxed text-fg-2">{blurb}</p>
        )}
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
