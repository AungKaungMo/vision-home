"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Move, Plus, Search, Sparkles, Wand2 } from "lucide-react";
import type { DesignListItem } from "@repo/schemas/designs";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DESIGN_TABS,
  SORT_OPTIONS,
  newDesignHref,
  type DesignSort,
  type DesignTab,
} from "@/feature/ai-redesign/constants";
import { DesignCard } from "@/feature/ai-redesign/components/designs/design-card";
import { DesignCardSkeleton } from "@/feature/ai-redesign/components/designs/design-card-skeleton";
import { useDesigns } from "@/feature/ai-redesign/hooks/queries/use-designs";

function matchesTab(design: DesignListItem, tab: DesignTab): boolean {
  if (tab === "trash") return design.trashed;
  if (design.trashed) return false;
  if (tab === "favorites") return design.isFavorite;
  if (tab === "generated" || tab === "edited") return design.source === tab;
  return true;
}

export function MyDesignsView() {
  const { data, isLoading, isError, refetch } = useDesigns();
  const designs = useMemo(() => data?.items ?? [], [data]);
  const [tab, setTab] = useState<DesignTab>("all");
  const [sort, setSort] = useState<DesignSort>("recent");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const result = {} as Record<DesignTab, number>;
    for (const { value } of DESIGN_TABS) {
      result[value] = designs.filter((design) =>
        matchesTab(design, value),
      ).length;
    }
    return result;
  }, [designs]);

  const visibleDesigns = useMemo(() => {
    const search = query.trim().toLowerCase();

    return designs
      .filter((design) => matchesTab(design, tab))
      .filter(
        (design) =>
          search === "" || design.title.toLowerCase().includes(search),
      )
      .sort((a, b) =>
        sort === "name"
          ? a.title.localeCompare(b.title)
          : sort === "oldest"
            ? Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
            : Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      );
  }, [designs, tab, sort, query]);

  const activeSort =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0]!;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 font-display text-3xl text-fg-1">
            <Sparkles
              aria-hidden
              className="size-6 text-terracotta"
              strokeWidth={2}
            />
            My Designs
          </h1>
          <p className="text-md leading-relaxed text-fg-2">
            Your generated designs and AI edits in one place.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="lg" className="shrink-0 shadow-primary" />}
          >
            <Plus aria-hidden strokeWidth={2.5} />
            Create New Design
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={newDesignHref("single_room")} />}>
              <Wand2 aria-hidden />
              Single room redesign
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/ai-studio/new/place-it-yourself" />}
            >
              <Move aria-hidden />
              Place it yourself
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-col gap-4 border-b border-divider pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter designs"
          className="flex flex-wrap gap-1.5"
        >
          {DESIGN_TABS.map((option) => {
            const active = tab === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(option.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-fast",
                  active
                    ? "border-terracotta bg-terracotta text-white shadow-sm"
                    : "border-border bg-surface text-fg-2 hover:bg-muted hover:text-fg-1",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    active ? "text-white/80" : "text-fg-3",
                  )}
                >
                  {counts[option.value]}
                </span>
              </button>
            );
          })}
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
              placeholder="Search designs"
              aria-label="Search designs"
              className="w-full pl-9 sm:w-52"
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
                onValueChange={(value) => setSort(value as DesignSort)}
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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <DesignCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-warm px-6 py-16 text-center">
          <div>
            <p className="text-sm font-medium text-fg-2">
              Couldn&apos;t load your designs.
            </p>
            <p className="mt-1 text-sm text-fg-3">
              Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : visibleDesigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border-strong bg-surface-warm px-6 py-16 text-center">
          <p className="text-sm font-medium text-fg-2">
            {query.trim()
              ? `No designs match “${query.trim()}”.`
              : tab === "trash"
                ? "Trash is empty."
                : "No designs here yet."}
          </p>
          <p className="mt-1 text-sm text-fg-3">
            {tab === "trash"
              ? "Designs you move to trash will appear here."
              : "Create a new design to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
