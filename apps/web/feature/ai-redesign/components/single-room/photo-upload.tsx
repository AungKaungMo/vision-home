"use client";

import Image from "next/image";
import { UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ImageCropperDialog } from "@/components/image-cropper-dialog";
import {
  coverGradientFor,
  type PhotoSource,
} from "@/feature/ai-redesign/constants";
import { usePhotoUpload } from "@/feature/ai-redesign/hooks/single-room/use-photo-upload";

export function PhotoUpload({
  value,
  onChange,
}: {
  value: PhotoSource | null;
  onChange: (value: PhotoSource | null) => void;
}) {
  const {
    pending,
    isDragging,
    openPicker,
    clear,
    onCropped,
    closeCropper,
    inputProps,
    dropzoneProps,
  } = usePhotoUpload({ onChange });

  if (value) {
    const sampleUrl = value.kind === "sample" ? value.imageUrl : null;

    return (
      <div className="relative aspect-3/2 overflow-hidden rounded-2xl border border-border bg-surface">
        {value.kind === "upload" ? (
          <Image
            src={value.url}
            alt={value.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : sampleUrl ? (
          <Image
            src={sampleUrl}
            alt={value.label}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              "grid h-full w-full place-items-center bg-linear-to-br",
              coverGradientFor(value.id),
            )}
          >
            <span className="font-display text-lg text-fg-1/70">
              {value.label}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={clear}
          aria-label="Remove photo"
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-surface/85 text-fg-2 shadow-sm backdrop-blur-sm transition-colors duration-fast hover:text-fg-1"
        >
          <X className="size-4" strokeWidth={2.25} />
        </button>

        <span className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-full bg-surface/85 px-3 py-1 text-xs font-medium text-fg-2 shadow-sm backdrop-blur-sm">
          {value.kind === "upload" ? value.name : `${value.label} · sample`}
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        {...dropzoneProps}
        className={cn(
          "flex aspect-3/2 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-surface-warm px-6 text-center transition-colors duration-fast",
          isDragging
            ? "border-terracotta bg-terracotta-muted"
            : "border-border-strong hover:border-terracotta-light hover:bg-surface",
        )}
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-terracotta-muted text-terracotta">
          <UploadCloud className="size-6" strokeWidth={2} />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-lg text-fg-1">
            Drop your room photo here
          </span>
          <span className="text-sm text-fg-3">
            or click to browse · JPG, PNG, WebP or AVIF up to 12MB
          </span>
        </span>

        <input {...inputProps} className="hidden" />
      </button>

      <ImageCropperDialog
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next) closeCropper();
        }}
        src={pending?.src ?? null}
        fileName={pending?.name}
        onCropped={onCropped}
      />
    </>
  );
}
