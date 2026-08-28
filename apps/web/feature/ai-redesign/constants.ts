import { Boxes, Home, LayoutGrid, type LucideIcon } from "lucide-react";

export type ProjectStatus = "completed" | "in-progress";

export type ProjectType = "single-room" | "whole-house" | "place-it-yourself";

export type Project = {
  id: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  updatedLabel: string;
  /** Lower is more recent — used for the "Most recent" sort. */
  updatedRank: number;
  description: string;
  primaryAction: string;
  /** Optional real cover render; falls back to an on-brand gradient. */
  image?: string;
};

export type ProjectTypeMeta = {
  label: string;
  icon: LucideIcon;
};

export const PROJECT_TYPE_META: Record<ProjectType, ProjectTypeMeta> = {
  "single-room": { label: "Single room", icon: Home },
  "whole-house": { label: "Whole house", icon: LayoutGrid },
  "place-it-yourself": { label: "Place it yourself", icon: Boxes },
};

/**
 * On-brand gradient covers. Each project picks one deterministically so the
 * grid stays visually varied until real render thumbnails are wired in.
 */
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

/** Route for the single-page create form of a given workflow type. */
export function newProjectHref(type: ProjectType): string {
  return `/ai-redesign/new/${type}`;
}

/** Public R2 base URL for sample assets, e.g. https://pub-xxx.r2.dev. */
const R2_BASE_URL = process.env.NEXT_PUBLIC_R2_URL ?? "";

/**
 * Build a public image URL from an R2 object key (such as a room type's
 * `defaultImageKey`), or `null` when either the key or the base URL is missing.
 */
export function r2ImageUrl(key: string | null | undefined): string | null {
  if (!key || !R2_BASE_URL) return null;
  return `${R2_BASE_URL}/${key}`;
}

export type WorkflowOption = {
  type: ProjectType;
  title: string;
  description: string;
};

/** Choices shown in the "Create project" picker dialog. */
export const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    type: "single-room",
    title: "Single room",
    description: "Redesign one room from a single photo.",
  },
  {
    type: "whole-house",
    title: "Whole house",
    description: "Plan and generate several rooms together.",
  },
  {
    type: "place-it-yourself",
    title: "Place it yourself",
    description: "Arrange furniture manually to design your own way.",
  },
];

/** A chosen source image for a redesign: an uploaded file or a sample room. */
export type PhotoSource =
  | { kind: "upload"; url: string; name: string }
  | { kind: "sample"; id: string; label: string; imageKey: string | null };

export type RoomStyle = { id: string; label: string };

/**
 * Ordered so a 2-column, row-first grid lays out as:
 *   Japandi | Modern
 *   Minimal | Boho
 *   Scandi  | Coastal
 *   Earthy  | Industrial
 */
export const ROOM_STYLES: RoomStyle[] = [
  { id: "japandi", label: "Japandi" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
  { id: "boho", label: "Boho" },
  { id: "scandi", label: "Scandi" },
  { id: "coastal", label: "Coastal" },
  { id: "earthy", label: "Earthy" },
  { id: "industrial", label: "Industrial" },
];

export const DEFAULT_ROOM_STYLE = "japandi";

export type ProjectFilter = "all" | ProjectType;

export const PROJECT_FILTERS: { value: ProjectFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "single-room", label: "Single room" },
  { value: "whole-house", label: "Whole house" },
  { value: "place-it-yourself", label: "Place it yourself" },
];

export type ProjectSort = "recent" | "name";

export const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "name", label: "Name (A–Z)" },
];

export const PROJECTS: Project[] = [
  {
    id: "japandi-living-room",
    title: "Japandi Living Room",
    type: "single-room",
    status: "completed",
    updatedLabel: "Updated 2h ago",
    updatedRank: 1,
    description:
      "Latest generated living room preview with soft wood tones and a warm, minimal styling direction.",
    primaryAction: "View details",
  },
  {
    id: "willow-house-phase-1",
    title: "Willow House · Phase 1",
    type: "whole-house",
    status: "completed",
    updatedLabel: "Updated yesterday",
    updatedRank: 2,
    description:
      "Kitchen and bedroom renders are grouped together, giving a true whole-house overview at a glance.",
    primaryAction: "View project",
  },
  {
    id: "studio-layout-test",
    title: "Studio Layout Test",
    type: "place-it-yourself",
    status: "in-progress",
    updatedLabel: "Updated 3d ago",
    updatedRank: 3,
    description:
      "An in-progress office layout so you can pick up the exact working draft the moment you reopen it.",
    primaryAction: "Resume editing",
  },
  {
    id: "coastal-house-rooms",
    title: "Coastal House Rooms",
    type: "whole-house",
    status: "completed",
    updatedLabel: "Updated 5d ago",
    updatedRank: 4,
    description:
      "A whole-house room collage makes larger multi-room projects feel concrete and easy to scan.",
    primaryAction: "View project",
  },
  {
    id: "urban-kitchen-refresh",
    title: "Urban Kitchen Refresh",
    type: "single-room",
    status: "completed",
    updatedLabel: "Updated 1w ago",
    updatedRank: 5,
    description:
      "A fresh single-room preview on the cover so you can spot the latest kitchen concept fast.",
    primaryAction: "View details",
  },
  {
    id: "maple-residence",
    title: "Maple Residence",
    type: "whole-house",
    status: "in-progress",
    updatedLabel: "Updated 1w ago",
    updatedRank: 6,
    description:
      "Two active room previews are combined on this cover to summarize the latest whole-house progress.",
    primaryAction: "Resume editing",
  },
];
