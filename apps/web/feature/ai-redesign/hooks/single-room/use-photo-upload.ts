"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, RefObject } from "react";
import { toast } from "sonner";

import { validateImageFile } from "@/lib/image-upload";
import type { CroppedImage } from "@/components/image-cropper-dialog";
import type { PhotoSource } from "@/feature/ai-redesign/constants";

type PendingImage = { src: string; name: string };

export type UsePhotoUpload = {
  pending: PendingImage | null;
  isDragging: boolean;
  openPicker: () => void;
  clear: () => void;
  onCropped: (image: CroppedImage) => void;
  closeCropper: () => void;
  inputProps: {
    ref: RefObject<HTMLInputElement | null>;
    type: "file";
    accept: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
  dropzoneProps: {
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDragLeave: () => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
  };
};

export function usePhotoUpload({
  onChange,
}: {
  onChange: (value: PhotoSource | null) => void;
}): UsePhotoUpload {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<PendingImage | null>(null);

  // Revoke the pending object URL when it changes or on unmount. The cropped
  // result's URL is owned by the parent.
  useEffect(() => {
    const src = pending?.src;
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [pending]);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setPending({ src: URL.createObjectURL(file), name: file.name });
    // Let the same file be re-picked after cancelling the crop.
    if (inputRef.current) inputRef.current.value = "";
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return {
    pending,
    isDragging: dragging,
    openPicker: () => inputRef.current?.click(),
    clear,
    onCropped: ({ file, url }) => {
      setPending(null);
      onChange({
        kind: "upload",
        url,
        name: file.name,
        file,
      });
    },
    closeCropper: () => setPending(null),
    inputProps: {
      ref: inputRef,
      type: "file",
      accept: "image/*",
      onChange: (event) => acceptFile(event.target.files?.[0]),
    },
    dropzoneProps: {
      onDragOver: (event) => {
        event.preventDefault();
        setDragging(true);
      },
      onDragLeave: () => setDragging(false),
      onDrop: (event) => {
        event.preventDefault();
        setDragging(false);
        acceptFile(event.dataTransfer.files[0]);
      },
    },
  };
}
