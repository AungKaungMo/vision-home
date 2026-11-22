"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DESIGN_TYPE_META,
  WORKFLOW_OPTIONS,
} from "@/feature/ai-redesign/constants";
import type { DesignType } from "@repo/schemas/designs";

import { useDesign } from "@/feature/ai-redesign/hooks/queries/use-design";

export function CreateDesignShell({
  type,
  children,
  wide = false,
  designId,
  actions,
  hasResult = false,
}: {
  type: DesignType;
  children?: React.ReactNode;
  wide?: boolean;
  designId?: string;
  actions?: React.ReactNode;
  hasResult?: boolean;
}) {
  const meta = DESIGN_TYPE_META[type];
  const option = WORKFLOW_OPTIONS.find((item) => item.type === type);
  if (!meta || !option) notFound();

  const { data: design, isLoading } = useDesign(designId);

  const loading = Boolean(designId) && isLoading;
  const heading = hasResult
    ? "Your Design is Ready!"
    : design?.title || option.title;
  const blurb = hasResult
    ? "Here's your reimagined space based on your photo and preferences."
    : design?.description || option.description;

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8",
        wide ? "max-w-5xl" : "max-w-3xl",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-fg-3"
          >
            <Link
              href="/ai-studio"
              className="font-medium transition-colors duration-fast hover:text-fg-1"
            >
              AI Studio
            </Link>
            <span aria-hidden>/</span>
            {designId ? (
              <Link
                href="/ai-studio"
                className="transition-colors duration-fast hover:text-fg-1"
              >
                My Designs
              </Link>
            ) : (
              <span className={hasResult ? undefined : "text-fg-2"}>
                Create New Design
              </span>
            )}
            {hasResult ? (
              <>
                <span aria-hidden>/</span>
                <span className="text-fg-2">Result</span>
              </>
            ) : null}
          </nav>

          {loading ? (
            <div className="h-9 w-72 animate-pulse rounded bg-muted" />
          ) : (
            <h1 className="flex items-center gap-2.5 font-display text-3xl text-fg-1">
              <Sparkles
                aria-hidden
                className="size-7 shrink-0 text-terracotta"
                strokeWidth={2}
              />
              {heading}
            </h1>
          )}

          {loading ? (
            <div className="h-5 w-full max-w-md animate-pulse rounded bg-muted" />
          ) : blurb ? (
            <p className="max-w-2xl text-md leading-relaxed text-fg-2">
              {blurb}
            </p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
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
