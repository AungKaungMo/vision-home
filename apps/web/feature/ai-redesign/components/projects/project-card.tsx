"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  PROJECT_TYPE_META,
  coverGradientFor,
  type Project,
} from "@/feature/ai-redesign/constants";
import { StatusBadge } from "@/feature/ai-redesign/components/projects/status-badge";

export function ProjectCard({ project }: { project: Project }) {
  const typeMeta = PROJECT_TYPE_META[project.type];
  const TypeIcon = typeMeta.icon;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-base ease-out hover:-translate-y-0.5 hover:shadow-md focus-within:ring-3 focus-within:ring-ring/30">
      <div
        className={cn(
          "relative aspect-3/2 bg-linear-to-br",
          coverGradientFor(project.id),
        )}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} redesign preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <TypeIcon
            aria-hidden
            className="absolute inset-0 m-auto size-10 text-fg-1/15"
            strokeWidth={1.5}
          />
        )}

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface/85 px-2.5 py-1 text-xs font-medium text-fg-2 shadow-sm backdrop-blur-sm">
          <TypeIcon aria-hidden className="size-3.5" strokeWidth={2.25} />
          {typeMeta.label}
        </span>
        <StatusBadge status={project.status} className="absolute top-3 right-3" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-md leading-snug text-fg-1">
            {project.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-fg-3">
            {project.updatedLabel}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-snug text-fg-2">
          {project.description}
        </p>

        {/* Visual affordance only — the whole card is the click target below. */}
        <div className="mt-auto flex items-center justify-end border-t border-divider pt-3">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta transition-colors duration-fast group-hover:text-terracotta-dark">
            {project.primaryAction}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-fast group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          </span>
        </div>
      </div>

      {/* Stretched overlay makes the entire card a single, large click target. */}
      <button
        type="button"
        onClick={() => toast(`${project.primaryAction} — ${project.title}`)}
        aria-label={`${project.primaryAction}: ${project.title}`}
        className="absolute inset-0 rounded-2xl outline-none"
      />
    </article>
  );
}
