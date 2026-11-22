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

/**
 * Florence-2 object detection — grounds every label in a real bounding box, so
 * (unlike a VLM asked to "list the furniture") it only reports items actually in
 * the frame and won't invent a sofa for an empty room.
 */
const DETECTION_MODEL = "fal-ai/florence-2-large/object-detection";

/** Architecture, surfaces, and people — detected, but not shoppable furniture. */
const NON_PRODUCT = new Set([
  "house",
  "home",
  "building",
  "room",
  "wall",
  "floor",
  "ceiling",
  "window",
  "door",
  "stairs",
  "fireplace",
  "vent",
  "air vent",
  "radiator",
  "outlet",
  "power outlet",
  "switch",
  "light switch",
  "thermostat",
  "smoke detector",
  "person",
  "man",
  "woman",
  "human face",
  "boy",
  "girl",
]);

/** Map a detected label to a broad shopping category; first match wins. */
const CATEGORY_RULES: [RegExp, string][] = [
  [/sofa|couch|armchair|chair|stool|bench|ottoman|seat/, "Seating"],
  [/coffee table|side table|nightstand|desk|table|console/, "Tables"],
  [/lamp|light|chandelier|sconce|lantern/, "Lighting"],
  [/plant|flower|vase|pot/, "Plants & Decor"],
  [/rug|carpet|mat/, "Rugs"],
  [/picture|painting|mirror|frame|clock|art/, "Wall Decor"],
  [/shelf|cabinet|bookcase|bookshelf|drawer|dresser|wardrobe|sideboard/, "Storage"],
  [/bed|headboard/, "Beds"],
  [/pillow|cushion|throw|blanket|curtain|drape/, "Textiles"],
  [/tv|television|monitor/, "Electronics"],
];

function titleCase(label: string): string {
  return label.replace(/\b\w/g, (character) => character.toUpperCase());
}

function categoryFor(label: string): string {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(label)) return category;
  }
  return "Decor";
}

/**
 * Categories that clearly aren't a room to redesign. Kept deliberately narrow
 * (the abuse cases: people, pets, food) so a borderline answer like "object" or
 * "outdoor" — which could be furniture or a sunroom — isn't wrongly rejected.
 */
const BLOCKED = ["person", "animal", "food"];

const REJECTION = "That doesn't look like a room photo — try an interior shot.";

type MoondreamResult = { output?: string };
type FlorenceResult = { results?: { bboxes?: { label?: string }[] } };

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
    const { data } = await runFalQueue<FlorenceResult>(DETECTION_MODEL, {
      image_url: image,
    });

    const products: DetectedProduct[] = [];
    const seen = new Set<string>();
    for (const box of data.results?.bboxes ?? []) {
      const label = (box.label ?? "").trim().toLowerCase();
      if (!label || NON_PRODUCT.has(label) || seen.has(label)) continue;
      seen.add(label);
      products.push({ name: titleCase(label), category: categoryFor(label) });
      if (products.length >= MAX_DETECTED_PRODUCTS) break;
    }
    return products;
  },
};
