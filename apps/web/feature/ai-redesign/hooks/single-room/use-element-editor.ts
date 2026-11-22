"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ApplyElementEditsInput } from "@repo/schemas/designs";

import type {
  ElementEdit,
  NormalizedEditRegion,
} from "@/feature/ai-redesign/components/single-room/element-edit-types";

export function useElementEditor() {
  const nextId = useRef(1);
  const [edits, setEdits] = useState<ElementEdit[]>([]);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);

  const addEdit = useCallback((region: NormalizedEditRegion) => {
    const id = `edit-${nextId.current}`;
    nextId.current += 1;

    setEdits((current) => [...current, { id, instruction: "", region }]);
    setActiveEditId(id);
  }, []);

  const updateRegion = useCallback(
    (id: string, region: NormalizedEditRegion) => {
      setEdits((current) =>
        current.map((edit) => (edit.id === id ? { ...edit, region } : edit)),
      );
    },
    [],
  );

  const updateInstruction = useCallback((id: string, instruction: string) => {
    setEdits((current) =>
      current.map((edit) => (edit.id === id ? { ...edit, instruction } : edit)),
    );
  }, []);

  const removeEdit = useCallback((id: string) => {
    setEdits((current) => current.filter((edit) => edit.id !== id));
    setActiveEditId((current) => (current === id ? null : current));
  }, []);

  const payload = useMemo<ApplyElementEditsInput>(
    () => ({
      edits: edits.map(({ instruction, region }) => ({
        instruction: instruction.trim(),
        region,
      })),
    }),
    [edits],
  );

  const canApply =
    edits.length > 0 &&
    edits.every((edit) => edit.instruction.trim().length > 0);

  return {
    edits,
    activeEditId,
    setActiveEditId,
    addEdit,
    updateRegion,
    updateInstruction,
    removeEdit,
    payload,
    canApply,
  };
}
