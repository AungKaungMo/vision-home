import { CONFIG } from "@/core/config";
import type { ImageUnderstandingPort } from "@/ports/image-understanding.port";

import { fakeImageUnderstanding } from "@/adapters/image-understanding/fake.adapter";
import { falImageUnderstanding } from "@/adapters/image-understanding/fal.adapter";

export const imageUnderstanding: ImageUnderstandingPort =
  CONFIG.USE_FAKE_ADAPTERS ? fakeImageUnderstanding : falImageUnderstanding;
