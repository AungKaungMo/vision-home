"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRoomType, fetchRoomTypes } from "@/feature/ai-redesign/api/room-types";

export function useRoomType(id?: string) {
  return useQuery({
    queryKey: ["room-types", id],
    queryFn: () => fetchRoomType(id!),
    enabled: Boolean(id),
  });
}

export function useRoomTypes() {
  return useQuery({
    queryKey: ["room-types"],
    queryFn: fetchRoomTypes,
  });
}
