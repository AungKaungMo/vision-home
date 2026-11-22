import type { ImageUnderstandingPort } from "@/ports/image-understanding.port";

/** Local/dev stand-in: never blocks an upload, returns a fixed product list. */
export const fakeImageUnderstanding: ImageUnderstandingPort = {
  async isInteriorRoom() {
    return { ok: true };
  },

  async detectProducts() {
    return [
      { category: "Seating", name: "Linen lounge chair" },
      { category: "Tables", name: "Travertine coffee table" },
      { category: "Lighting", name: "Paper floor lamp" },
      { category: "Plants", name: "Large monstera" },
    ];
  },
};
