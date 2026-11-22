export type RoomCheck = { ok: boolean; reason?: string };

export interface ImageUnderstandingPort {
  /**
   * Judge whether an image is a photo of a room interior. Accepts an http(s)
   * URL or a base64 data URI. Used to reject non-room uploads (people, pets,
   * object close-ups, outdoor shots) before a generation is spent on them.
   */
  isInteriorRoom(image: string): Promise<RoomCheck>;
}
