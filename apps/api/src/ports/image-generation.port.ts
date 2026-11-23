import type { ElementEdit } from "@repo/schemas/designs";

export type ImageGenerationStyle = {
  code: string;
  promptHint?: string | null;
};

export type ImageGenerationInput = {
  sourceImageUrl: string;
  styles: ImageGenerationStyle[];
  details?: string | null;
  roomTypeHint?: string | null;
};

export type GeneratedImage = {
  styleCode: string | null;
  url: string;
};

export type ImageGenerationResult = {
  providerRequestId: string;
  image: GeneratedImage;
};

/**
 * Localized edits applied to an already-generated render. Each edit's region is
 * normalized (`0..1`) so the provider can map it onto the base image at any size.
 */
export type ElementEditInput = {
  baseImageUrl: string;
  edits: ElementEdit[];
  roomTypeHint?: string | null;
};

export interface ImageGenerationPort {
  readonly provider: string;
  readonly modelId: string;
  submit(input: ImageGenerationInput): Promise<ImageGenerationResult>;
  edit(input: ElementEditInput): Promise<ImageGenerationResult>;
}
