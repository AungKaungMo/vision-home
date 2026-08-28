"use client";

import { cn } from "@/lib/utils";
import {
  coverGradientFor,
  type PhotoSource,
} from "@/feature/ai-redesign/constants";
import { useRoomTypes } from "@/feature/ai-redesign/hooks/use-room-types";
import { Check } from "lucide-react";
import Image from "next/image";

export function RoomTypePicker({
  value,
  onChange,
}: {
  value: PhotoSource | null;
  onChange: (value: PhotoSource) => void;
}) {
  const { data, isLoading, isError, refetch } = useRoomTypes();

  const roomTypes = data?.items ?? [];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-fg-2">Or try a sample room</p>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-1.5 p-1">
              <div className="aspect-4/3 animate-pulse rounded-lg bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
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
      ) : roomTypes.length === 0 ? (
        <p className="text-sm text-fg-3">No sample rooms available.</p>
      ) : (
        <div
          role="radiogroup"
          aria-label="Sample room"
          className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto"
        >
            {roomTypes.map((roomType) => {
              const active =
                value?.kind === "sample" && value.id === roomType.id;
              const imageUrl = roomType.defaultImageUrl;

              return (
                <button
                  key={roomType.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() =>
                    onChange({
                      kind: "sample",
                      id: roomType.id,
                      label: roomType.name,
                      imageKey: roomType.defaultImageKey,
                    })
                  }
                  className="group flex flex-col gap-1.5 rounded-xl p-1 text-left"
                >
                  <span
                    className={cn(
                      "relative aspect-4/3 overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-surface transition-all duration-fast",
                      active
                        ? "ring-2 ring-terracotta"
                        : "ring-1 ring-border group-hover:ring-terracotta/50",
                    )}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={roomType.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        className={cn(
                          "object-cover transition-transform duration-fast",
                          active ? "scale-105" : "group-hover:scale-105",
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "block h-full w-full bg-linear-to-br",
                          coverGradientFor(roomType.id),
                        )}
                      />
                    )}

                    {active && (
                      <span className="absolute inset-0 bg-terracotta/10" />
                    )}
                    {active && (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-terracotta text-white shadow-sm">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "px-0.5 text-xs font-medium transition-colors duration-fast",
                      active ? "text-terracotta" : "text-fg-2",
                    )}
                  >
                    {roomType.name}
                  </span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
