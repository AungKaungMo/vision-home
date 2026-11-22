"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

import {
  CATALOG,
  CATALOG_CATEGORIES,
  type CatalogCategory,
  type CatalogItem,
} from "@/feature/ai-redesign/components/place-it-yourself/catalog";
import { cn } from "@/lib/utils";

type Filter = "All" | CatalogCategory;

export function CatalogPanel({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (item: CatalogItem) => void;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const items =
    filter === "All"
      ? CATALOG
      : CATALOG.filter((item) => item.category === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-fg-1">Catalog</h2>
        <p className="text-xs text-fg-3">
          {disabled
            ? "Add a room photo first, then place items."
            : "Tap to drop an item onto your room."}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["All", ...CATALOG_CATEGORIES] as Filter[]).map((category) => {
          const active = filter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
                active
                  ? "border-terracotta bg-terracotta text-white"
                  : "border-border bg-surface text-fg-2 hover:bg-muted hover:text-fg-1",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onAdd(item)}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="160px"
                className="object-cover transition-transform duration-base group-hover:scale-105"
                unoptimized
              />
              <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-terracotta text-white opacity-0 shadow-sm transition-opacity duration-fast group-hover:opacity-100">
                <Plus aria-hidden className="size-4" strokeWidth={2.5} />
              </span>
            </div>
            <div className="flex flex-col gap-0.5 p-2.5">
              <span className="truncate text-sm font-medium text-fg-1">
                {item.name}
              </span>
              <span className="text-xs text-fg-3">{item.price}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
