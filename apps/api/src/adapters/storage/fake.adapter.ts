import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";

import { CONFIG } from "@/core/config";
import type { StoragePort } from "@/ports/storage.port";

type StoredObject = { body: Buffer; contentType: string };

const storageRoot = resolve(process.cwd(), "asset/storage");

function pathFor(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  if (!cleanKey) throw new Error("Fake storage: key is required");

  const path = resolve(storageRoot, cleanKey);
  const relativePath = relative(storageRoot, path);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error("Fake storage: invalid key");
  }
  return path;
}

async function writeObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const path = pathFor(key);
  await mkdir(dirname(path), { recursive: true });
  await Promise.all([
    writeFile(path, body),
    writeFile(`${path}.meta.json`, JSON.stringify({ contentType })),
  ]);
}

async function readObject(key: string): Promise<StoredObject | undefined> {
  const path = pathFor(key);
  try {
    const [body, metadata] = await Promise.all([
      readFile(path),
      readFile(`${path}.meta.json`, "utf8"),
    ]);
    const { contentType } = JSON.parse(metadata) as { contentType: string };
    return { body, contentType };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export const devStorage = {
  get(key: string): Promise<StoredObject | undefined> {
    return readObject(key);
  },
};

function devStorageBase(): string {
  return `${CONFIG.DEV_API_ORIGIN}/api/v1/dev-storage`;
}

export const fakeStorage: StoragePort = {
  putObject({ key, body, contentType }) {
    return writeObject(key, Buffer.from(body), contentType);
  },

  async headObject(key) {
    const object = await readObject(key);
    if (!object) {
      throw new Error(`Fake storage: object not found (${key})`);
    }
    return {
      contentType: object.contentType,
      contentLength: object.body.length,
    };
  },

  async copyObject({ sourceKey, destinationKey }) {
    const object = await readObject(sourceKey);
    if (!object) {
      throw new Error(`Fake storage: object not found (${sourceKey})`);
    }
    await writeObject(destinationKey, object.body, object.contentType);
  },

  publicUrl(key) {
    if (!key) return null;
    return `${devStorageBase()}/${key.replace(/^\//, "")}`;
  },

  keyFromPublicUrl(url) {
    const prefix = `${devStorageBase()}/`;
    if (!url.startsWith(prefix)) return null;
    const key = url.slice(prefix.length);
    return key || null;
  },
};
