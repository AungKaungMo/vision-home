import { imageSize } from "image-size";

import { mimeForImageType } from "@/core/image-mime";
import { putObject, roomRenderKey } from "@/core/storage";
import { prisma } from "@/database/prisma";
import type { GeneratedImage } from "@/ports/image-generation.port";

export async function persistGenerationOutput(
  roomId: string,
  generationId: string,
  image: GeneratedImage,
): Promise<void> {
  const response = await fetch(image.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch render (${response.status})`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const { width, height, type } = imageSize(bytes);
  const mimeType = mimeForImageType(type);
  if (!type || !mimeType || !width || !height) {
    throw new Error("Render image is not a supported format");
  }

  const storageKey = roomRenderKey(roomId, generationId, type);
  await putObject({ key: storageKey, body: bytes, contentType: mimeType });

  await prisma.asset.create({
    data: {
      roomId,
      generationId,
      type: "generated",
      styleCode: image.styleCode,
      storageKey,
      mimeType,
      sizeBytes: BigInt(bytes.length),
      width,
      height,
    },
  });
}
