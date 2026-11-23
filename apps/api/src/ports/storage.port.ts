export type HeadObjectResult = {
  contentType: string | undefined;
  contentLength: number | undefined;
};

export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
};

export type CopyObjectInput = {
  sourceKey: string;
  destinationKey: string;
};

export interface StoragePort {
  headObject(key: string): Promise<HeadObjectResult>;
  putObject(input: PutObjectInput): Promise<void>;
  copyObject(input: CopyObjectInput): Promise<void>;
  publicUrl(key: string | null | undefined): string | null;
  keyFromPublicUrl(url: string): string | null;
}
