import { Boxes, Home, LayoutGrid, type LucideIcon } from "lucide-react";
import type { ProjectType } from "@repo/schemas/projects";

export type ProjectTypeMeta = {
  label: string;
  icon: LucideIcon;
};

export const PROJECT_TYPE_META: Record<ProjectType, ProjectTypeMeta> = {
  single_room: { label: "Single room", icon: Home },
  whole_house: { label: "Whole house", icon: LayoutGrid },
  place_it_yourself: { label: "Place it yourself", icon: Boxes },
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

export function newProjectHref(type: ProjectType): string {
  return `/ai-redesign/new/${type.replaceAll("_", "-")}`;
}

export type WorkflowOption = {
  type: ProjectType;
  title: string;
  description: string;
};

export const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    type: "single_room",
    title: "Single room",
    description: "Redesign one room from a single photo.",
  },
  {
    type: "whole_house",
    title: "Whole house",
    description: "Plan and generate several rooms together.",
  },
  {
    type: "place_it_yourself",
    title: "Place it yourself",
    description: "Arrange furniture manually to design your own way.",
  },
];

export type PhotoSource =
  | {
      kind: "upload";
      url: string;
      name: string;
      file: File;
    }
  | { kind: "sample"; id: string; label: string; imageUrl: string };

/** Fallback style pre-selected on the single-room form; must match a seeded `DesignStyle.code`. */
export const DEFAULT_ROOM_STYLE = "japandi";

export type ProjectFilter = "all" | ProjectType;

export const PROJECT_FILTERS: { value: ProjectFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "single_room", label: "Single room" },
  { value: "whole_house", label: "Whole house" },
  { value: "place_it_yourself", label: "Place it yourself" },
];

export type ProjectSort = "recent" | "name";

export const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "name", label: "Name (A–Z)" },
];
