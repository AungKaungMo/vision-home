"use client";

import { Rnd } from "react-rnd";
import Image from "next/image";
import { X } from "lucide-react";

import type { PlacedItem } from "@/feature/ai-redesign/components/place-it-yourself/catalog";
import { cn } from "@/lib/utils";

type PlacementBox = Pick<PlacedItem, "x" | "y" | "width" | "height">;

export function PlacedItemBox({
  item,
  active,
  canvasSize,
  onSelect,
  onChange,
  onRemove,
}: {
  item: PlacedItem;
  active: boolean;
  canvasSize: { width: number; height: number };
  onSelect: () => void;
  onChange: (patch: Partial<PlacementBox>) => void;
  onRemove: () => void;
}) {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;

  if (canvasWidth === 0 || canvasHeight === 0) return null;

  return (
    <Rnd
      bounds="parent"
      minWidth={48}
      minHeight={48}
      lockAspectRatio
      position={{ x: item.x * canvasWidth, y: item.y * canvasHeight }}
      size={{
        width: item.width * canvasWidth,
        height: item.height * canvasHeight,
      }}
      style={{ zIndex: active ? 20 : 10 }}
      onDragStart={onSelect}
      onDragStop={(_, position) =>
        onChange({
          x: position.x / canvasWidth,
          y: position.y / canvasHeight,
        })
      }
      onResizeStart={onSelect}
      onResizeStop={(_, __, element, ___, position) =>
        onChange({
          x: position.x / canvasWidth,
          y: position.y / canvasHeight,
          width: element.offsetWidth / canvasWidth,
          height: element.offsetHeight / canvasHeight,
        })
      }
      onMouseDown={onSelect}
      onTouchStart={onSelect}
      className="outline-none"
    >
      <div
        className={cn(
          "relative size-full cursor-move overflow-hidden rounded-lg border-2 bg-surface shadow-sm",
          active
            ? "border-terracotta shadow-primary"
            : "border-white/80 shadow-black/20",
        )}
      >
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="320px"
          className="object-cover"
          unoptimized
        />

        {active && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            className="absolute -top-2.5 -right-2.5 z-10 grid size-6 place-items-center rounded-full bg-terracotta text-white shadow-md transition-colors duration-fast hover:bg-terracotta-dark"
          >
            <X aria-hidden className="size-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </Rnd>
  );
}
