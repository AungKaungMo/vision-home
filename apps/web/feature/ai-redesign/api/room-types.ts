import type {
  RoomTypeDetail,
  RoomTypeListItem,
} from "@repo/schemas/room-types";

import { api, type ApiEnvelope } from "@/lib/api/client";

export function fetchRoomTypes() {
  return api
    .get<ApiEnvelope<{ items: RoomTypeListItem[] }>>("/v1/room-types")
    .then((res) => res?.data?.data);
}

export function fetchRoomType(id: string) {
  return api
    .get<ApiEnvelope<RoomTypeDetail>>(`/v1/room-types/${id}`)
    .then((res) => res?.data?.data);
}
