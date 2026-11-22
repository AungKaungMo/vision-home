import type { ImageUnderstandingPort } from "@/ports/image-understanding.port";

import { runFalQueue } from "@/adapters/fal/queue";

/** Moondream2 visual-query — a small, cheap VLM for yes/no image questions. */
const MODEL_ID = "fal-ai/moondream2/visual-query";

const PROMPT =
  "Classify this photo as exactly one word from: room, person, animal, food, object, outdoor. Which is it?";

/**
 * Categories that clearly aren't a room to redesign. Kept deliberately narrow
 * (the abuse cases: people, pets, food) so a borderline answer like "object" or
 * "outdoor" — which could be furniture or a sunroom — isn't wrongly rejected.
 */
const BLOCKED = ["person", "animal", "food"];

const REJECTION = "That doesn't look like a room photo — try an interior shot.";

type MoondreamResult = { output?: string };

export const falImageUnderstanding: ImageUnderstandingPort = {
  async isInteriorRoom(image) {
    const { data } = await runFalQueue<MoondreamResult>(MODEL_ID, {
      image_url: image,
      prompt: PROMPT,
    });

    const answer = (data.output ?? "").trim().toLowerCase();
    const blocked = BLOCKED.some((category) => answer.includes(category));
    return blocked ? { ok: false, reason: REJECTION } : { ok: true };
  },
};
