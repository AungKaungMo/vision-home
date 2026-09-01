import { CONFIG } from "@/core/config";
import type { ImageGenerationPort } from "@/ports/image-generation.port";

import { fakeImageGeneration } from "@/adapters/image-generation/fake.adapter";
import { falImageGeneration } from "@/adapters/image-generation/fal.adapter";

export const imageGeneration: ImageGenerationPort = CONFIG.USE_FAKE_ADAPTERS
  ? fakeImageGeneration
  : falImageGeneration;
