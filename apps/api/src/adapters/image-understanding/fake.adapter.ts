import type { ImageUnderstandingPort } from "@/ports/image-understanding.port";

/** Local/dev stand-in: never blocks an upload. */
export const fakeImageUnderstanding: ImageUnderstandingPort = {
  async isInteriorRoom() {
    return { ok: true };
  },
};
