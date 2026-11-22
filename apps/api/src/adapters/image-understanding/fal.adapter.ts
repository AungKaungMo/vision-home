import { MAX_DETECTED_PRODUCTS } from "@repo/schemas/designs";

import type {
  DetectedProduct,
  ImageUnderstandingPort,
} from "@/ports/image-understanding.port";

import { runFalQueue } from "@/adapters/fal/queue";

/** Moondream2 visual-query — a small, cheap VLM for yes/no image questions. */
const MODEL_ID = "fal-ai/moondream2/visual-query";

const PROMPT =
  "Classify this photo as exactly one word from: room, person, animal, food, object, outdoor. Which is it?";

const PRODUCTS_PROMPT =
  "List the main furniture and decor items in this interior, one per line, " +
  `formatted exactly as "Category: Item name" (e.g. "Seating: Linen sofa"). ` +
  `Use a short general category. List at most ${MAX_DETECTED_PRODUCTS} items, no extra text.`;

/**
 * Parse the VLM's "Category: Item name" lines into products, dropping anything
 * malformed (blank lines, list bullets, a stray sentence). Deliberately lenient:
 * a flaky line is skipped rather than failing the whole detection.
 */
function parseProductLines(output: string): DetectedProduct[] {
  const products: DetectedProduct[] = [];
  for (const raw of output.split("\n")) {
    const line = raw.replace(/^[\s\d.*-]+/, "").trim();
    const separator = line.indexOf(":");
    if (separator <= 0) continue;

    const category = line.slice(0, separator).trim();
    const name = line.slice(separator + 1).trim();
    if (category && name) {
      products.push({ category, name });
    }
    if (products.length >= MAX_DETECTED_PRODUCTS) break;
  }
  return products;
}

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

  async detectProducts(image) {
    const { data } = await runFalQueue<MoondreamResult>(MODEL_ID, {
      image_url: image,
      prompt: PRODUCTS_PROMPT,
    });

    return parseProductLines(data.output ?? "");
  },
};
