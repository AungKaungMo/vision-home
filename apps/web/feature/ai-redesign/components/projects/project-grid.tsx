"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PROJECT_FILTERS,
  SORT_OPTIONS,
  type ProjectFilter,
  type ProjectSort,
} from "@/feature/ai-redesign/constants";
import { ProjectCard } from "@/feature/ai-redesign/components/projects/project-card";
import { ProjectCardSkeleton } from "@/feature/ai-redesign/components/projects/project-card-skeleton";
import { useProjects } from "@/feature/ai-redesign/hooks/queries/use-projects";

export function ProjectGrid() {
  const { data, isLoading, isError, refetch } = useProjects();
  const projects = data?.items;
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [sort, setSort] = useState<ProjectSort>("recent");
  const [query, setQuery] = useState("");

  const visibleProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    return (projects ?? [])
      .filter((project) => filter === "all" || project.type === filter)
      .filter(
        (project) =>
          search === "" || project.title.toLowerCase().includes(search),
      )
      .sort((a, b) =>
        sort === "name"
          ? a.title.localeCompare(b.title)
          : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      );
  }, [projects, filter, sort, query]);

  const activeSort =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0]!;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl text-fg-1">All projects</h2>
          <p className="max-w-xl text-sm leading-snug text-fg-2">
            Every redesign in one place. Search, filter, and sort to find the
            project you need.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-3"
              strokeWidth={2}
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="w-full pl-9 sm:w-56"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="shrink-0" />
              }
            >
              <ArrowUpDown aria-hidden strokeWidth={2} />
              {activeSort.label}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(value) => setSort(value as ProjectSort)}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter projects by type"
        className="flex flex-wrap gap-1.5"
      >
        {PROJECT_FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-fast",
                active
                  ? "border-terracotta bg-terracotta text-white shadow-sm"
                  : "border-border bg-surface text-fg-2 hover:bg-muted hover:text-fg-1",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-warm px-6 py-16 text-center">
          <div>
            <p className="text-sm font-medium text-fg-2">
              Couldn&apos;t load your projects.
            </p>
            <p className="mt-1 text-sm text-fg-3">
              Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : visibleProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border-strong bg-surface-warm px-6 py-16 text-center">
          <p className="text-sm font-medium text-fg-2">
            {query.trim()
              ? `No projects match “${query.trim()}”.`
              : "No projects of this type yet."}
          </p>
          <p className="mt-1 text-sm text-fg-3">
            Try a different search or filter, or create a new project.
          </p>
        </div>
      )}
    </section>
  );
}
