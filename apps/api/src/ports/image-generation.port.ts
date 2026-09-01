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

export interface ImageGenerationPort {
  readonly provider: string;
  readonly modelId: string;
  submit(input: ImageGenerationInput): Promise<ImageGenerationResult>;
}
