"use client";

import { useMemo, useState } from "react";

import { useRoomTypes } from "@/feature/ai-redesign/hooks/queries/use-room-type";

type ExistingRoomTypeOption = {
  kind: "existing";
  value: string;
  label: string;
};

type CustomRoomTypeOption = {
  kind: "custom";
  value: string;
  label: string;
};

type CreateRoomTypeOption = {
  kind: "create";
  value: string;
  label: string;
};

export type RoomTypeOption =
  | ExistingRoomTypeOption
  | CustomRoomTypeOption
  | CreateRoomTypeOption;

type RoomTypeSelection = ExistingRoomTypeOption | CustomRoomTypeOption;

export type UseRoomTypeSelect = {
  selected: RoomTypeSelection | null;
  items: RoomTypeOption[];
  inputValue: string;
  isLoading: boolean;
  onValueChange: (value: RoomTypeOption | null) => void;
  onInputValueChange: (value: string) => void;
  reset: () => void;
};

export function useRoomTypeSelect(): UseRoomTypeSelect {
  const { data, isLoading } = useRoomTypes();

  const [selected, setSelected] = useState<RoomTypeSelection | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [createdRooms, setCreatedRooms] = useState<CustomRoomTypeOption[]>([]);

  const apiRooms = useMemo<ExistingRoomTypeOption[]>(
    () =>
      (data?.items ?? []).map((item) => ({
        kind: "existing",
        value: item.id,
        label: item.name,
      })),
    [data],
  );
  const allRooms = useMemo<RoomTypeOption[]>(
    () => [...apiRooms, ...createdRooms],
    [apiRooms, createdRooms],
  );

  // Inject a "Create …" row when the typed value has no exact match. Base UI
  // filters `items` by the input value, so the create row (label === query)
  // stays visible alongside any partial matches.
  const trimmedQuery = inputValue.trim();
  const hasExactMatch = allRooms.some(
    (option) => option.label.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const items: RoomTypeOption[] =
    trimmedQuery && !hasExactMatch
      ? [
          ...allRooms,
          {
            kind: "create",
            value: `create:${trimmedQuery.toLowerCase()}`,
            label: trimmedQuery,
          },
        ]
      : allRooms;

  function onValueChange(value: RoomTypeOption | null) {
    if (!value) {
      setSelected(null);
      return;
    }
    if (value.kind === "create") {
      const label = value.label.trim();
      const existing = createdRooms.find(
        (option) => option.label.toLowerCase() === label.toLowerCase(),
      );
      const chosen: CustomRoomTypeOption = existing ?? {
        kind: "custom",
        value: label,
        label,
      };
      if (!existing) setCreatedRooms((prev) => [...prev, chosen]);
      setSelected(chosen);
      setInputValue("");
      return;
    }
    setSelected(value);
    setInputValue("");
  }

  function reset() {
    setSelected(null);
    setInputValue("");
    setCreatedRooms([]);
  }

  return {
    selected,
    items,
    inputValue,
    isLoading,
    onValueChange,
    onInputValueChange: setInputValue,
    reset,
  };
}
