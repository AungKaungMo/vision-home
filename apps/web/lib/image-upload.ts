export const DEFAULT_IMAGE_SIZE_LIMIT = 12 * 1024 * 1024;

export const DEFAULT_IMAGE_ACCEPT_TYPES = [
  "avif",
  "png",
  "jpeg",
  "jpg",
  "webp",
];

type ValidateImageOptions = {
  sizeLimit?: number;
  acceptType?: string[];
};

export function validateImageFile(
  file: File,
  {
    sizeLimit = DEFAULT_IMAGE_SIZE_LIMIT,
    acceptType = DEFAULT_IMAGE_ACCEPT_TYPES,
  }: ValidateImageOptions = {},
): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!acceptType.includes(ext)) {
    return `Please choose a ${acceptType.join(", ")} image.`;
  }
  if (file.size > sizeLimit) {
    return `That image is over ${Math.round(sizeLimit / 1024 / 1024)}MB. Please choose a smaller file.`;
  }
  return null;
}

export type PixelCrop = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

export async function getCroppedImageFile(
  src: string,
  area: PixelCrop,
  fileName: string,
  mimeType = "image/jpeg",
): Promise<{ file: File; url: string; width: number; height: number }> {
  const image = await loadImage(src);
  const width = Math.round(area.width);
  const height = Math.round(area.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, 0.92),
  );
  if (!blob) throw new Error("Could not export cropped image");

  const file = new File([blob], fileName, { type: mimeType });
  return { file, url: URL.createObjectURL(file), width, height };
}
