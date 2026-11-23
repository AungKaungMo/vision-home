export type RoomCheck = { ok: boolean; reason?: string };

/** A furniture/decor item spotted in a render — name + broad category only. */
export type DetectedProduct = { name: string; category: string };

export interface ImageUnderstandingPort {
  /**
   * Judge whether an image is a photo of a room interior. Accepts an http(s)
   * URL or a base64 data URI. Used to reject non-room uploads (people, pets,
   * object close-ups, outdoor shots) before a generation is spent on them.
   */
  isInteriorRoom(image: string): Promise<RoomCheck>;

  /**
   * Enumerate the shoppable furniture/decor visible in a completed render, so
   * the UI can link each out to a search. Accepts an http(s) URL or data URI.
   * No prices or inventory — just what's in the frame.
   */
  detectProducts(image: string): Promise<DetectedProduct[]>;
}
