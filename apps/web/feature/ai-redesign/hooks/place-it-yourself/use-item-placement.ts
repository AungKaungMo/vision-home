"use client";

import { useCallback, useState } from "react";

import type {
  CatalogItem,
  PlacedItem,
} from "@/feature/ai-redesign/components/place-it-yourself/catalog";

type PlacementBox = Pick<PlacedItem, "x" | "y" | "width" | "height">;

// A newly added item lands as a centered square, big enough to grab but small
// enough not to swamp the room.
const DEFAULT_BOX: PlacementBox = { x: 0.36, y: 0.36, width: 0.28, height: 0.28 };

export function useItemPlacement() {
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addItem = useCallback((item: CatalogItem) => {
    const id = crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      {
        id,
        catalogId: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        ...DEFAULT_BOX,
      },
    ]);
    setActiveId(id);
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<PlacementBox>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  return { items, activeId, setActiveId, addItem, updateItem, removeItem };
}
