"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PhotoSource } from "@/feature/ai-redesign/constants";
import { useRoomTypes } from "@/feature/ai-redesign/hooks/queries/use-room-type";

type SampleTile = {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  imageUrl: string;
};

export function RoomTypePicker({
  value,
  onChange,
}: {
  value: PhotoSource | null;
  onChange: (value: PhotoSource) => void;
}) {
  const { data, isLoading, isError, refetch } = useRoomTypes();

  // Flatten every room type's samples into one gallery; each tile remembers its
  // room type so picking it also sets the design's room type.
  const tiles: SampleTile[] = (data?.items ?? []).flatMap((roomType) =>
    roomType.samples.map((imageUrl, index) => ({
      id: `${roomType.id}:${index}`,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      imageUrl,
    })),
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-fg-2">Or pick a sample room</p>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-1">
              <div className="aspect-4/3 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-warm px-3.5 py-3 text-sm text-fg-2">
          <span>Couldn&apos;t load sample rooms.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold text-terracotta transition-colors duration-fast hover:text-terracotta-dark"
          >
            Retry
          </button>
        </div>
      ) : tiles.length === 0 ? (
        <p className="text-sm text-fg-3">No sample rooms are available yet.</p>
      ) : (
        <div
          role="radiogroup"
          aria-label="Sample room"
          className="grid max-h-72 grid-cols-3 gap-3 overflow-y-auto"
        >
          {tiles.map((tile) => {
            const active = value?.kind === "sample" && value.id === tile.id;

            return (
              <button
                key={tile.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={tile.roomTypeName}
                onClick={() =>
                  onChange({
                    kind: "sample",
                    id: tile.id,
                    label: tile.roomTypeName,
                    imageUrl: tile.imageUrl,
                    roomTypeId: tile.roomTypeId,
                  })
                }
                className="group flex flex-col gap-1.5 rounded-xl p-1 text-left"
              >
                <div
                  className={cn(
                    "relative aspect-4/3 overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-surface transition-all duration-fast",
                    active
                      ? "ring-2 ring-terracotta"
                      : "ring-1 ring-border group-hover:ring-terracotta/50",
                  )}
                >
                  <Image
                    src={tile.imageUrl}
                    alt={tile.roomTypeName}
                    fill
                    sizes="(max-width: 768px) 33vw, 200px"
                    className={cn(
                      "object-cover transition-transform duration-fast",
                      active ? "scale-105" : "group-hover:scale-105",
                    )}
                  />

                  {active && (
                    <span className="absolute inset-0 bg-terracotta/10" />
                  )}
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-terracotta text-white shadow-sm">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "truncate px-0.5 text-xs font-medium transition-colors duration-fast",
                    active ? "text-terracotta" : "text-fg-2",
                  )}
                >
                  {tile.roomTypeName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
