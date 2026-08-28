"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DEFAULT_ROOM_STYLE,
  type PhotoSource,
} from "@/feature/ai-redesign/constants";
import { PhotoUpload } from "@/feature/ai-redesign/components/single-room/photo-upload";
import { RoomTypePicker } from "@/feature/ai-redesign/components/single-room/room-type-picker";
import { StylePicker } from "@/feature/ai-redesign/components/single-room/style-picker";

export function SingleRoomForm() {
  const [source, setSource] = useState<PhotoSource | null>(null);
  const [styles, setStyles] = useState<string[]>([DEFAULT_ROOM_STYLE]);
  const [details, setDetails] = useState("");

  // Own the uploaded object URL's lifecycle here, since both PhotoUpload and
  // RoomTypePicker swap `source`: revoke the previous upload URL on every
  // change (and on unmount) so blobs never leak.
  const objectUrlRef = useRef<string | null>(null);

  const handleSourceChange = useCallback((next: PhotoSource | null) => {
    const nextUrl = next?.kind === "upload" ? next.url : null;
    if (objectUrlRef.current && objectUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = nextUrl;
    setSource(next);
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const canGenerate = source !== null && styles.length > 0;

  function handleGenerate() {
    const count = styles.length;
    toast(`Generating a redesign in ${count} ${count === 1 ? "style" : "styles"}…`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: source photo */}
      <div className="flex flex-col gap-6">
        <PhotoUpload value={source} onChange={handleSourceChange} />
        <RoomTypePicker value={source} onChange={handleSourceChange} />
      </div>

      {/* Right: style + details + generate */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
        <StylePicker value={styles} onChange={setStyles} />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="single-room-details"
            className="flex items-baseline gap-1.5 text-sm font-medium text-fg-1"
          >
            Additional details
            <span className="text-xs font-normal text-fg-3">optional</span>
          </label>
          <textarea
            id="single-room-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={3}
            placeholder={'Tell the AI anything specific — e.g. "keep the wooden floor, add plants".'}
            className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm outline-none transition-[color,box-shadow] placeholder:text-fg-3 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-surface-warm px-3.5 py-3 text-sm text-fg-2">
          <Sparkles
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-terracotta"
            strokeWidth={2}
          />
          <p className="leading-snug">
            Blending styles? The AI weighs them evenly across layered textiles
            and finishes.
          </p>
        </div>

        <Button
          size="lg"
          disabled={!canGenerate}
          onClick={handleGenerate}
          className="w-full shadow-primary"
        >
          <Wand2 aria-hidden strokeWidth={2.25} />
          Generate redesign
        </Button>

        {!canGenerate && (
          <p className="-mt-3 text-center text-xs text-fg-3">
            Upload a photo or pick a sample room to start.
          </p>
        )}
      </div>
    </div>
  );
}
