import { z } from "zod";

/** A design style from GET /api/v1/design-styles. Shared by the API and web app. */
export const designStyleSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  promptHint: z.string().nullable(),
});

export type DesignStyle = z.infer<typeof designStyleSchema>;
