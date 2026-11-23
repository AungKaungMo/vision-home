import type {
  ElementEditInput,
  ImageGenerationInput,
} from "@/ports/image-generation.port";

/** Describe a normalized region in plain words the model can localize. */
function describeRegion(
  region: ElementEditInput["edits"][number]["region"],
): string {
  const pct = (value: number) => Math.round(value * 100);
  const centerX = pct(region.x + region.width / 2);
  const centerY = pct(region.y + region.height / 2);
  return `centered near ${centerX}% across and ${centerY}% down, roughly ${pct(region.width)}%×${pct(region.height)}% of the image`;
}

/** Prompt for a full-room restyle (image-to-image). */
export function buildGenerationPrompt(input: ImageGenerationInput): string {
  const lines = [
    `Redesign this ${input.roomTypeHint ?? "room"} interior photo into a single photorealistic image.`,
    "Preserve the room's architecture, layout, window positions, and camera angle.",
  ];

  const styleHints = input.styles
    .map((style) => style.promptHint?.trim() || style.code)
    .filter(Boolean);
  if (styleHints.length > 0) {
    lines.push(
      `Apply these design styles, blended evenly: ${styleHints.join("; ")}.`,
    );
  }
  if (input.details?.trim()) {
    lines.push(`Additional direction: ${input.details.trim()}.`);
  }

  return lines.join("\n");
}

/** Prompt for localized element edits against an existing render. */
export function buildEditPrompt(input: ElementEditInput): string {
  const lines = [
    "Edit this interior photo. Apply only the localized changes below and keep everything else identical, preserving lighting, perspective, and photorealism.",
  ];
  input.edits.forEach((edit, index) => {
    lines.push(
      `${index + 1}. In the area ${describeRegion(edit.region)}: ${edit.instruction}`,
    );
  });
  return lines.join("\n");
}
