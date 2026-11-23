"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MoreVertical,
  RotateCcw,
  SquareArrowOutUpRight,
  Trash2,
} from "lucide-react";
import type { DesignListItem } from "@repo/schemas/designs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DESIGN_TYPE_META,
  coverGradientFor,
  designDetailHref,
} from "@/feature/ai-redesign/constants";
import { SourceBadge } from "@/feature/ai-redesign/components/designs/source-badge";
import {
  useDeleteDesign,
  useRestoreDesign,
  useToggleFavorite,
  useTrashDesign,
} from "@/feature/ai-redesign/hooks/designs/use-design-mutations";

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function DesignCard({ design }: { design: DesignListItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const typeMeta = DESIGN_TYPE_META[design.type];
  const TypeIcon = typeMeta.icon;
  const imageUrl = imageFailed ? null : design.generatedImageUrl;
  const href = designDetailHref(design.id);

  const toggleFavorite = useToggleFavorite();
  const trash = useTrashDesign();
  const restore = useRestoreDesign();
  const remove = useDeleteDesign();

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-base ease-out hover:-translate-y-0.5 hover:shadow-md focus-within:ring-3 focus-within:ring-ring/30">
      <div
        className={cn(
          "relative aspect-3/2 overflow-hidden",
          !imageUrl && ["bg-linear-to-br", coverGradientFor(design.id)],
        )}
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover transition-transform duration-base ease-out group-hover:scale-[1.02]"
              onError={() => setImageFailed(true)}
              unoptimized
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
          </>
        ) : (
          <TypeIcon
            aria-hidden
            className="absolute inset-0 m-auto size-10 text-fg-1/15"
            strokeWidth={1.5}
          />
        )}

        {/* Covers the image only, so the heart and menu below stay clickable. */}
        <Link
          href={href}
          aria-label={`Open ${design.title}`}
          className="absolute inset-0 outline-none"
        />

        <SourceBadge
          source={design.source}
          className="pointer-events-none absolute top-3 left-3"
        />

        <button
          type="button"
          aria-label={
            design.isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={design.isFavorite}
          onClick={() =>
            toggleFavorite.mutate({
              id: design.id,
              isFavorite: !design.isFavorite,
            })
          }
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-surface/85 text-fg-2 shadow-sm backdrop-blur-sm transition-colors duration-fast hover:text-terracotta focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          <Heart
            aria-hidden
            className={cn(
              "size-4 transition-colors",
              design.isFavorite && "fill-terracotta text-terracotta",
            )}
            strokeWidth={2.25}
          />
        </button>
      </div>

      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-md leading-snug text-fg-1">
            {design.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-fg-3">
            {DATE_FORMATTER.format(new Date(design.updatedAt))}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="-mr-1 shrink-0 text-fg-3"
                aria-label={`Actions for ${design.title}`}
              />
            }
          >
            <MoreVertical aria-hidden strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {design.trashed ? (
              <>
                <DropdownMenuItem onClick={() => restore.mutate(design.id)}>
                  <RotateCcw aria-hidden />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => remove.mutate(design.id)}
                >
                  <Trash2 aria-hidden />
                  Delete permanently
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem render={<Link href={href} />}>
                  <SquareArrowOutUpRight aria-hidden />
                  Open
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => trash.mutate(design.id)}
                >
                  <Trash2 aria-hidden />
                  Move to trash
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
