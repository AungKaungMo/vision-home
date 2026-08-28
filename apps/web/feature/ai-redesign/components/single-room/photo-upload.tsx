"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  coverGradientFor,
  r2ImageUrl,
  type PhotoSource,
} from "@/feature/ai-redesign/constants";

/** Matches the "up to 12MB" promise in the dropzone copy. */
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export function PhotoUpload({
  value,
  onChange,
}: {
  value: PhotoSource | null;
  onChange: (value: PhotoSource | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image. Please choose a JPG or PNG.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("That image is over 12MB. Please choose a smaller file.");
      return;
    }
    // The object URL's lifecycle (revocation) is owned by the parent, which
    // revokes the previous upload URL whenever `source` changes or unmounts.
    onChange({ kind: "upload", url: URL.createObjectURL(file), name: file.name });
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (value) {
    const sampleUrl = value.kind === "sample" ? r2ImageUrl(value.imageKey) : null;

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
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        acceptFile(event.dataTransfer.files[0]);
      }}
      className={cn(
        "flex aspect-3/2 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-surface-warm px-6 text-center transition-colors duration-fast",
        dragging
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
          or click to browse · JPG, PNG up to 12MB
        </span>
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
    </button>
  );
}
