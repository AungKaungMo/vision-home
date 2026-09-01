"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PhotoSource } from "@/feature/ai-redesign/constants";
import { useRoomType } from "@/feature/ai-redesign/hooks/queries/use-room-type";

export function RoomTypePicker({
  roomTypeId,
  value,
  onChange,
}: {
  roomTypeId?: string;
  value: PhotoSource | null;
  onChange: (value: PhotoSource) => void;
}) {
  const {
    data: roomType,
    isLoading,
    isError,
    refetch,
  } = useRoomType(roomTypeId);

  const samples = roomType?.samples ?? [];
  const roomTypeName = roomType?.name ?? "this room type";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-fg-2">Or pick a sample room</p>

      {!roomTypeId ? (
        <p className="text-sm text-fg-3">
          No sample rooms are available for this room type.
        </p>
      ) : isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
      ) : samples.length === 0 ? (
        <p className="text-sm text-fg-3">
          {`No sample rooms are available for ${roomTypeName}.`}
        </p>
      ) : (
        <div
          role="radiogroup"
          aria-label="Sample room"
          className="grid max-h-60 grid-cols-3 gap-3 overflow-y-auto"
        >
          {samples.map((imageUrl, index) => {
            const sampleId = `${roomTypeId}:${index}`;
            const active = value?.kind === "sample" && value.id === sampleId;

            return (
              <button
                key={imageUrl}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${roomTypeName} sample ${index + 1}`}
                onClick={() =>
                  onChange({
                    kind: "sample",
                    id: sampleId,
                    label: roomTypeName,
                    imageUrl,
                  })
                }
                className="flex flex-col gap-1.5 rounded-xl p-1 text-left"
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
                    src={imageUrl}
                    alt={`${roomTypeName} sample ${index + 1}`}
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
                      "px-0.5 text-xs font-medium transition-colors duration-fast",
                      active ? "text-terracotta" : "text-fg-2",
                    )}
                  >
                    {`Layout ${index + 1}`}
                  </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
