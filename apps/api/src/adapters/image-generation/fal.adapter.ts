import type {
  ImageGenerationPort,
  ImageGenerationResult,
} from "@/ports/image-generation.port";

import { runFalQueue } from "@/adapters/fal/queue";
import {
  buildEditPrompt,
  buildGenerationPrompt,
} from "@/adapters/image-generation/prompt";

/** FLUX.1 Kontext [dev] — instruction-based image editing, the cheap tier. */
const MODEL_ID = "fal-ai/flux-kontext/dev";

type KontextResult = { images?: { url: string }[] };

async function runKontext(
  prompt: string,
  imageUrl: string,
  styleCode: string | null,
): Promise<ImageGenerationResult> {
  const { requestId, data } = await runFalQueue<KontextResult>(MODEL_ID, {
    prompt,
    image_url: imageUrl,
  });

  const url = data.images?.at(0)?.url;
  if (!url) {
    throw new Error("fal returned no image");
  }

  return { providerRequestId: requestId, image: { styleCode, url } };
}

export const falImageGeneration: ImageGenerationPort = {
  provider: "fal",
  modelId: MODEL_ID,

  async submit(input) {
    return runKontext(
      buildGenerationPrompt(input),
      input.sourceImageUrl,
      input.styles.at(0)?.code ?? null,
    );
  },

  async edit(input) {
    return runKontext(buildEditPrompt(input), input.baseImageUrl, null);
  },
};
