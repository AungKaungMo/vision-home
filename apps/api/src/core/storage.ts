import { randomUUID } from "node:crypto";

import { IMAGE_EXTENSION_BY_MIME } from "@repo/schemas/projects";
import type { ImageMimeType } from "@repo/schemas/projects";

import { storage } from "@/adapters/storage";
import { r2Storage } from "@/adapters/storage/r2.adapter";
import type {
  CopyObjectInput,
  HeadObjectResult,
  PutObjectInput,
} from "@/ports/storage.port";

export type { CopyObjectInput, HeadObjectResult, PutObjectInput };

export function storagePublicUrl(
  key: string | null | undefined,
): string | null {
  return storage.publicUrl(key);
}

export function storageKeyFromPublicUrl(url: string): string | null {
  return storage.keyFromPublicUrl(url);
}

export function catalogPublicUrl(
  key: string | null | undefined,
): string | null {
  return r2Storage.publicUrl(key);
}

export function catalogKeyFromPublicUrl(url: string): string | null {
  return r2Storage.keyFromPublicUrl(url);
}

export function extensionForMime(mimeType: ImageMimeType): string {
  return IMAGE_EXTENSION_BY_MIME[mimeType];
}

export function roomSourceKey(roomId: string, extension: string): string {
  return `rooms/${roomId}/sources/${randomUUID()}.${extension}`;
}

export function roomRenderKey(
  roomId: string,
  generationId: string,
  extension: string,
): string {
  return `rooms/${roomId}/renders/${generationId}/${randomUUID()}.${extension}`;
}

export function headObject(key: string): Promise<HeadObjectResult> {
  return storage.headObject(key);
}

export function putObject(input: PutObjectInput): Promise<void> {
  return storage.putObject(input);
}

export function copyObject(input: CopyObjectInput): Promise<void> {
  return storage.copyObject(input);
}
