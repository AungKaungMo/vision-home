"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getCroppedImageFile, type PixelCrop } from "@/lib/image-upload";

export type CroppedImage = {
  file: File;
  url: string;
  /** Output pixel dimensions — reported to the API alongside the upload. */
  width: number;
  height: number;
};

const ASPECT_PRESETS = [
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
] as const;

export function ImageCropperDialog({
  open,
  onOpenChange,
  src,
  fileName = "photo.jpg",
  defaultAspect = 4 / 3,
  onCropped,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Object URL of the image to crop. */
  src: string | null;
  fileName?: string;
  defaultAspect?: number;
  onCropped: (result: CroppedImage) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(defaultAspect);
  const [areaPixels, setAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Reset the framing whenever a new image is loaded.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [src]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  async function handleApply() {
    if (!src || !areaPixels) return;
    setIsCropping(true);
    try {
      onCropped(await getCroppedImageFile(src, areaPixels, fileName));
    } finally {
      setIsCropping(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
          <DialogDescription>
            Adjust the frame so the room fills it, then apply.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-xl bg-muted">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              objectFit="cover"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {ASPECT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setAspect(preset.value)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
                  aspect === preset.value
                    ? "border-terracotta bg-terracotta-muted text-terracotta"
                    : "border-border text-fg-2 hover:bg-muted",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-fg-2">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="accent-terracotta"
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!areaPixels || isCropping}>
            {isCropping ? "Applying…" : "Apply crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
