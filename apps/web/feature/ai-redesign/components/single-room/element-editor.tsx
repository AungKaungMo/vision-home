"use client";

import { ElementEditCanvas } from "@/feature/ai-redesign/components/single-room/element-edit-canvas";
import { ElementEditPanel } from "@/feature/ai-redesign/components/single-room/element-edit-panel";
import { useApplyElementEdits } from "@/feature/ai-redesign/hooks/single-room/use-apply-element-edits";
import { useElementEditor } from "@/feature/ai-redesign/hooks/single-room/use-element-editor";

export function ElementEditor({
  baseAssetId,
  imageUrl,
  onApplied,
}: {
  baseAssetId: string;
  imageUrl: string;
  onApplied: (generationId: string) => void;
}) {
  const editor = useElementEditor();
  const apply = useApplyElementEdits(onApplied);

  function applyEdits() {
    if (!editor.canApply || apply.isPending) return;
    apply.mutate({ baseAssetId, input: editor.payload });
  }

  return (
    <div className="flex flex-col gap-4">
      <ElementEditCanvas
        imageUrl={imageUrl}
        edits={editor.edits}
        activeEditId={editor.activeEditId}
        onAdd={editor.addEdit}
        onSelect={editor.setActiveEditId}
        onChange={editor.updateRegion}
      />
      <ElementEditPanel
        edits={editor.edits}
        activeEditId={editor.activeEditId}
        canApply={editor.canApply}
        isApplying={apply.isPending}
        onSelect={editor.setActiveEditId}
        onInstructionChange={editor.updateInstruction}
        onRemove={editor.removeEdit}
        onApply={applyEdits}
      />
    </div>
  );
}
