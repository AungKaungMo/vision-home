import type { ImageMimeType } from "@repo/schemas/designs";

const MIME_BY_IMAGE_TYPE: Record<string, ImageMimeType> = {
  avif: "image/avif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function mimeForImageType(
  type: string | undefined,
): ImageMimeType | null {
  return (type && MIME_BY_IMAGE_TYPE[type]) || null;
}
