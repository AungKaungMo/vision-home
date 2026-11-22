import { Home, type LucideIcon } from "lucide-react";
import type { DesignSource, DesignType } from "@repo/schemas/designs";

export type DesignTypeMeta = {
  label: string;
  icon: LucideIcon;
};

export const DESIGN_TYPE_META: Record<DesignType, DesignTypeMeta> = {
  single_room: { label: "Single room", icon: Home },
};

export const DESIGN_SOURCE_META: Record<DesignSource, { label: string }> = {
  generated: { label: "Generated" },
  edited: { label: "Edited" },
};

export const COVER_GRADIENTS = [
  "from-terracotta-muted to-terracotta-light",
  "from-sage-muted to-sage-light",
  "from-navy-muted to-navy-light",
  "from-terracotta-light to-sage-muted",
  "from-sage-light to-navy-muted",
  "from-navy-light to-terracotta-muted",
];

export function coverGradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length]!;
}

export function newDesignHref(type: DesignType): string {
  return `/ai-studio/new/${type.replaceAll("_", "-")}`;
}

/** An existing design opens on its own detail route, separate from the create flow. */
export function designDetailHref(id: string): string {
  return `/ai-studio/designs/${encodeURIComponent(id)}`;
}

export type WorkflowOption = {
  type: DesignType;
  title: string;
  description: string;
};

export const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    type: "single_room",
    title: "Single room",
    description: "Redesign one room from a single photo.",
  },
];

export type PhotoSource =
  | {
      kind: "upload";
      url: string;
      name: string;
      file: File;
    }
  | {
      kind: "sample";
      id: string;
      label: string;
      imageUrl: string;
      roomTypeId: string;
    };

/** Fallback style pre-selected on the single-room form; must match a seeded `DesignStyle.code`. */
export const DEFAULT_ROOM_STYLE = "japandi";

/** The tabs across the top of the My Designs gallery. */
export type DesignTab = "all" | "generated" | "edited" | "favorites" | "trash";

export const DESIGN_TABS: { value: DesignTab; label: string }[] = [
  { value: "all", label: "All Designs" },
  { value: "generated", label: "Generated" },
  { value: "edited", label: "Edited" },
  { value: "favorites", label: "Favorites" },
  { value: "trash", label: "Trash" },
];

export type DesignSort = "recent" | "oldest" | "name";

export const SORT_OPTIONS: { value: DesignSort; label: string }[] = [
  { value: "recent", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name (A–Z)" },
];
