import { randomUUID } from "node:crypto";

import { CONFIG } from "@/core/config";
import type { ImageGenerationPort } from "@/ports/image-generation.port";

/** Simulated provider latency so the async job lifecycle is exercised in dev. */
const FAKE_LATENCY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fakeImageGeneration: ImageGenerationPort = {
  provider: "fake",
  modelId: "fake-echo",

  async submit() {
    await delay(FAKE_LATENCY_MS);

    return {
      providerRequestId: `fake_${randomUUID()}`,
      image: {
        styleCode: null,
        url: `${CONFIG.DEV_API_ORIGIN}/asset/img/default.webp`,
      },
    };
  },
};
