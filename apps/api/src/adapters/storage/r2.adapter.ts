import {
  CopyObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { CONFIG } from "@/core/config";
import type { StoragePort } from "@/ports/storage.port";

let client: S3Client | null = null;

/**
 * Lazily build the R2 (S3-compatible) client. R2's endpoint is derived from the
 * account id; credentials and bucket come from config. Throws if storage isn't
 * configured, since write operations can't degrade gracefully the way
 * `publicUrl` does.
 */
function r2Client(): S3Client {
  if (client) return client;

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = CONFIG;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "R2 storage is not configured (missing account id or credentials).",
    );
  }

  client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    // R2 rejects checksum headers added by default for commands that don't need
    // them, so only calculate checksums when a command requires one.
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  return client;
}

function r2Bucket(): string {
  const bucket = CONFIG.R2_BUCKET;
  if (!bucket) {
    throw new Error("R2 storage is not configured (missing R2_BUCKET).");
  }
  return bucket;
}

export const r2Storage: StoragePort = {
  async headObject(key) {
    const result = await r2Client().send(
      new HeadObjectCommand({ Bucket: r2Bucket(), Key: key }),
    );
    return {
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    };
  },

  async putObject({ key, body, contentType }) {
    await r2Client().send(
      new PutObjectCommand({
        Bucket: r2Bucket(),
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  },

  async copyObject({ sourceKey, destinationKey }) {
    const bucket = r2Bucket();
    // `CopySource` is `encodeURI`d to survive spaces while preserving the `/`
    // path separators S3 expects.
    await r2Client().send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: destinationKey,
        CopySource: encodeURI(`${bucket}/${sourceKey}`),
      }),
    );
  },

  publicUrl(key) {
    const base = CONFIG.R2_PUBLIC_URL;
    if (!key || !base) return null;
    return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
  },

  keyFromPublicUrl(url) {
    const base = CONFIG.R2_PUBLIC_URL;
    if (!url || !base) return null;
    const prefix = `${base.replace(/\/$/, "")}/`;
    if (!url.startsWith(prefix)) return null;
    const key = url.slice(prefix.length);
    return key || null;
  },
};
