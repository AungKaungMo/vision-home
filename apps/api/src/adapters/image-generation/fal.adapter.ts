import { CONFIG } from "@/core/config";
import type { ImageGenerationPort } from "@/ports/image-generation.port";

export const falImageGeneration: ImageGenerationPort = {
  provider: "fal",
  modelId: "fal-ai/flux/dev/image-to-image",

  async submit() {
    if (!CONFIG.FAL_KEY) {
      throw new Error("FAL_KEY is not configured");
    }

    throw new Error("fal image generation adapter is not implemented yet");
  },
};
