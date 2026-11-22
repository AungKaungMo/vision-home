"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/feature/ai-redesign/components/single-room/photo-upload";
import { CatalogPanel } from "@/feature/ai-redesign/components/place-it-yourself/catalog-panel";
import { PlacementCanvas } from "@/feature/ai-redesign/components/place-it-yourself/placement-canvas";
import { useItemPlacement } from "@/feature/ai-redesign/hooks/place-it-yourself/use-item-placement";
import type { PhotoSource } from "@/feature/ai-redesign/constants";

export function PlaceItYourselfForm() {
  const [source, setSource] = useState<PhotoSource | null>(null);
  const { items, activeId, setActiveId, addItem, updateItem, removeItem } =
    useItemPlacement();

  const roomUrl =
    source?.kind === "upload"
      ? source.url
      : source?.kind === "sample"
        ? source.imageUrl
        : null;

  const canGenerate = Boolean(roomUrl) && items.length > 0;

  function generate() {
    if (!canGenerate) return;
    toast.info("Compositing is coming soon — this is the placement preview.");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
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
          <span className="text-fg-2">Place It Yourself</span>
        </nav>

        <h1 className="flex items-center gap-2.5 font-display text-3xl text-fg-1">
          <Sparkles
            aria-hidden
            className="size-7 shrink-0 text-terracotta"
            strokeWidth={2}
          />
          Place It Yourself
        </h1>
        <p className="max-w-2xl text-md leading-relaxed text-fg-2">
          Drop furniture into your room photo and arrange it exactly how you
          want — then let the AI blend it in.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          {roomUrl ? (
            <PlacementCanvas
              roomUrl={roomUrl}
              items={items}
              activeId={activeId}
              onSelect={setActiveId}
              onChange={updateItem}
              onRemove={removeItem}
            />
          ) : (
            <PhotoUpload value={source} onChange={setSource} />
          )}

          {roomUrl && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-fg-3">
                {items.length === 0
                  ? "No items placed yet."
                  : `${items.length} item${items.length === 1 ? "" : "s"} placed.`}
              </p>
              <button
                type="button"
                onClick={() => setSource(null)}
                className="text-sm font-semibold text-terracotta transition-colors duration-fast hover:text-terracotta-dark"
              >
                Change photo
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5">
          <CatalogPanel disabled={!roomUrl} onAdd={addItem} />

          <Button
            size="lg"
            disabled={!canGenerate}
            onClick={generate}
            className="w-full shadow-primary"
          >
            <Wand2 aria-hidden strokeWidth={2.25} />
            Generate design
          </Button>

          {!canGenerate && (
            <p className="-mt-3 text-center text-xs text-fg-3">
              {roomUrl
                ? "Place at least one item to generate."
                : "Upload a room photo to start."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
