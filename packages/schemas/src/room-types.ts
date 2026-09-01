import { z } from "zod";

/** A room type in the GET /api/v1/room-types list — just enough to choose one. */
export const roomTypeListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type RoomTypeListItem = z.infer<typeof roomTypeListItemSchema>;

/** A single room type from GET /api/v1/room-types/:id, with its sample images. */
export const roomTypeDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  promptHint: z.string().nullable(),
  /** Full public R2 URLs for the sample images, built by the API. */
  samples: z.array(z.string()),
});

export type RoomTypeDetail = z.infer<typeof roomTypeDetailSchema>;
