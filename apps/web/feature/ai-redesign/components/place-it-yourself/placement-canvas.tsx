"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { PlacedItem } from "@/feature/ai-redesign/components/place-it-yourself/catalog";
import { PlacedItemBox } from "@/feature/ai-redesign/components/place-it-yourself/placed-item";

type PlacementBox = Pick<PlacedItem, "x" | "y" | "width" | "height">;

export function PlacementCanvas({
  roomUrl,
  items,
  activeId,
  onSelect,
  onChange,
  onRemove,
}: {
  roomUrl: string;
  items: PlacedItem[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<PlacementBox>) => void;
  onRemove: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Rnd needs pixel positions, so track the rendered canvas size and convert
  // to/from the items' normalized coordinates.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setCanvasSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function clearSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onSelect(null);
  }

  return (
    <div
      ref={canvasRef}
      className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm md:aspect-16/9"
    >
      <Image
        src={roomUrl}
        alt="Your room"
        fill
        sizes="(max-width: 1024px) 100vw, 720px"
        className="object-cover"
        unoptimized
      />

      <div
        role="application"
        aria-label="Arrange items on your room photo"
        className="absolute inset-0 touch-none select-none"
        onPointerDown={clearSelection}
      >
        {items.map((item) => (
          <PlacedItemBox
            key={item.id}
            item={item}
            active={item.id === activeId}
            canvasSize={canvasSize}
            onSelect={() => onSelect(item.id)}
            onChange={(patch) => onChange(item.id, patch)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs font-medium text-white/90 drop-shadow-md">
          Tap an item in the catalog to drop it here, then drag to position it.
        </p>
      )}
    </div>
  );
}
