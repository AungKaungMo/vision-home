import { api, type ApiEnvelope } from "@/lib/api/client";

export type RoomType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  defaultImageKey: string | null;
  /** Full public R2 URL for `defaultImageKey`, built by the API. */
  defaultImageUrl: string | null;
  promptHint: string | null;
  sortOrder: number;
};

/** GET /api/v1/room-types — returns the full (small) set, unpaginated. */
export function fetchRoomTypes() {
  return api
    .get<ApiEnvelope<{ items: RoomType[] }>>("/v1/room-types")
    .then((res) => res.data.data);
}
