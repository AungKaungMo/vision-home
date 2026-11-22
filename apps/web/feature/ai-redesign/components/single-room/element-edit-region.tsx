"use client";

import { Rnd } from "react-rnd";

import type { NormalizedEditRegion } from "@/feature/ai-redesign/components/single-room/element-edit-types";
import { cn } from "@/lib/utils";

export function ElementEditRegion({
  index,
  region,
  active,
  canvasSize,
  onSelect,
  onChange,
}: {
  index: number;
  region: NormalizedEditRegion;
  active: boolean;
  canvasSize: { width: number; height: number };
  onSelect: () => void;
  onChange: (region: NormalizedEditRegion) => void;
}) {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;

  if (canvasWidth === 0 || canvasHeight === 0) return null;

  return (
    <Rnd
      bounds="parent"
      minWidth={40}
      minHeight={40}
      position={{
        x: region.x * canvasWidth,
        y: region.y * canvasHeight,
      }}
      size={{
        width: region.width * canvasWidth,
        height: region.height * canvasHeight,
      }}
      style={{ zIndex: active ? 20 : 10 }}
      onDragStart={onSelect}
      onDragStop={(_, position) =>
        onChange({
          ...region,
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
          "relative size-full cursor-move rounded-xl border-2 bg-white/10 shadow-sm backdrop-brightness-95",
          active
            ? "border-terracotta shadow-primary"
            : "border-white/90 shadow-black/20",
        )}
      >
        <span
          className={cn(
            "absolute -top-3 -left-3 grid size-7 place-items-center rounded-full text-xs font-bold text-white shadow-md",
            active ? "bg-terracotta" : "bg-black/65",
          )}
        >
          {index + 1}
        </span>

        {[
          "-top-1 -left-1",
          "-top-1 -right-1",
          "-bottom-1 -left-1",
          "-right-1 -bottom-1",
        ].map((position) => (
          <span
            key={position}
            className={cn(
              "pointer-events-none absolute size-2 rounded-full border border-white",
              position,
              active ? "bg-terracotta" : "bg-black/60",
            )}
          />
        ))}
      </div>
    </Rnd>
  );
}
