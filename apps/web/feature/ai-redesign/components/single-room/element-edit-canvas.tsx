"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { ElementEditRegion } from "@/feature/ai-redesign/components/single-room/element-edit-region";
import type {
  ElementEdit,
  NormalizedEditRegion,
} from "@/feature/ai-redesign/components/single-room/element-edit-types";

const MIN_REGION_SIZE = 0.025;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function regionBetween(
  start: { x: number; y: number },
  end: { x: number; y: number },
): NormalizedEditRegion {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function ElementEditCanvas({
  imageUrl,
  edits,
  activeEditId,
  onAdd,
  onSelect,
  onChange,
}: {
  imageUrl: string;
  edits: ElementEdit[];
  activeEditId: string | null;
  onAdd: (region: NormalizedEditRegion) => void;
  onSelect: (id: string | null) => void;
  onChange: (id: string, region: NormalizedEditRegion) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawingStart = useRef<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [draft, setDraft] = useState<NormalizedEditRegion | null>(null);

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

  function pointFromEvent(event: ReactPointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    };
  }

  function startDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.target !== event.currentTarget) return;

    const point = pointFromEvent(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingStart.current = point;
    setDraft({ x: point.x, y: point.y, width: 0, height: 0 });
    onSelect(null);
  }

  function continueDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drawingStart.current) return;
    setDraft(regionBetween(drawingStart.current, pointFromEvent(event)));
  }

  function finishDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drawingStart.current) return;

    const region = regionBetween(drawingStart.current, pointFromEvent(event));
    drawingStart.current = null;
    setDraft(null);

    if (region.width >= MIN_REGION_SIZE && region.height >= MIN_REGION_SIZE) {
      onAdd(region);
    }
  }

  return (
    <div
      ref={canvasRef}
      className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm md:aspect-16/9"
    >
      <Image
        src={imageUrl}
        alt="Redesigned room ready for element editing"
        fill
        sizes="(max-width: 1024px) 100vw, 960px"
        className="object-cover"
        unoptimized
      />

      <span className="pointer-events-none absolute top-4 right-4 z-30 rounded-full bg-terracotta px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase shadow-sm">
        Editing
      </span>

      <div
        role="application"
        aria-label="Draw, move, and resize areas to edit"
        className="absolute inset-0 touch-none cursor-crosshair select-none"
        onPointerDown={startDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={finishDrawing}
        onPointerCancel={() => {
          drawingStart.current = null;
          setDraft(null);
        }}
      >
        {edits.map((edit, index) => (
          <ElementEditRegion
            key={edit.id}
            index={index}
            region={edit.region}
            active={edit.id === activeEditId}
            canvasSize={canvasSize}
            onSelect={() => onSelect(edit.id)}
            onChange={(region) => onChange(edit.id, region)}
          />
        ))}

        {draft && (
          <div
            className="pointer-events-none absolute rounded-xl border-2 border-dashed border-terracotta bg-terracotta/15"
            style={{
              left: `${draft.x * 100}%`,
              top: `${draft.y * 100}%`,
              width: `${draft.width * 100}%`,
              height: `${draft.height * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
