"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRoomTypes } from "@/feature/ai-redesign/api/room-types";

/** All room types from /api/v1/room-types (small, unpaginated set). */
export function useRoomTypes() {
  return useQuery({
    queryKey: ["room-types"],
    queryFn: fetchRoomTypes,
  });
}
