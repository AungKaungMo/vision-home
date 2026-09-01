"use client";

import { useState } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";

export function BeforeAfterComparison({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm focus-within:ring-3 focus-within:ring-ring/30 md:aspect-16/9">
      <Image
        src={afterUrl}
        alt="Redesigned room"
        fill
        sizes="(max-width: 1024px) 100vw, 960px"
        className="object-cover"
        unoptimized
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeUrl}
          alt="Original room"
          fill
          sizes="(max-width: 1024px) 100vw, 960px"
          className="object-cover"
          unoptimized
        />
      </div>

      <span className="absolute top-4 left-4 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
        Before
      </span>
      <span className="absolute top-4 right-4 z-10 rounded-full bg-terracotta px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase shadow-sm">
        After
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-md"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white text-fg-1 shadow-lg">
          <MoveHorizontal className="size-5" strokeWidth={2} />
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Compare the original and redesigned room"
        className="absolute inset-0 z-30 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
