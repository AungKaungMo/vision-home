import { z } from "zod";

/** Design workflow types. Values match the Prisma `DesignType` enum. */
export const DESIGN_TYPES = ["single_room"] as const;

export const designTypeSchema = z.enum(DESIGN_TYPES);
export type DesignType = z.infer<typeof designTypeSchema>;

/** Design lifecycle states. Values match the Prisma `DesignStatus` enum. */
export const DESIGN_STATUSES = ["draft", "active", "archived"] as const;

export const designStatusSchema = z.enum(DESIGN_STATUSES);
export type DesignStatus = z.infer<typeof designStatusSchema>;

/**
 * How a design came to be — drives the gallery badge. `generated` designs come
 * from the redesign flow; `edited` designs come from element editing. Values
 * match the Prisma `DesignSource` enum.
 */
export const DESIGN_SOURCES = ["generated", "edited"] as const;

export const designSourceSchema = z.enum(DESIGN_SOURCES);
export type DesignSource = z.infer<typeof designSourceSchema>;

/**
 * Payload for POST /api/v1/designs. Shared by the API and web app.
 *
 * Room type is optional and either a known `roomTypeId` OR a hand-typed
 * `roomTypeLabel` — never both.
 */
export const createDesignSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    description: z.string().trim().max(500).optional(),
    type: designTypeSchema,
    roomTypeId: z.string().uuid().optional(),
    roomTypeLabel: z.string().trim().min(1).max(100).optional(),
  })
  .refine((value) => !(value.roomTypeId && value.roomTypeLabel), {
    message: "Provide either a room type or a custom label, not both",
    path: ["roomTypeLabel"],
  });

export type CreateDesignInput = z.infer<typeof createDesignSchema>;

export const designRoomSchema = z.object({
  id: z.string(),
  roomTypeId: z.string().nullable(),
  roomTypeLabel: z.string().nullable(),
});

export type DesignRoom = z.infer<typeof designRoomSchema>;

/**
 * A design returned by POST /api/v1/designs and GET /api/v1/designs/:id.
 * The create page reads its title/description (and room) from here rather than
 * carrying them through the URL.
 */
export const designDetailSchema = z.object({
  id: z.string(),
  type: designTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  room: designRoomSchema.nullable(),
  latestGenerationId: z.string().nullable(),
});

export type DesignDetail = z.infer<typeof designDetailSchema>;

export const designListItemSchema = z.object({
  id: z.string(),
  type: designTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  status: designStatusSchema,
  source: designSourceSchema,
  isFavorite: z.boolean(),
  /** True when the design is in the trash (soft-deleted, still recoverable). */
  trashed: z.boolean(),
  updatedAt: z.string(),
  generatedImageUrl: z.string().url().nullable(),
});

export type DesignListItem = z.infer<typeof designListItemSchema>;

export const IMAGE_MIME_TYPES = [
  "image/avif",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const imageMimeTypeSchema = z.enum(IMAGE_MIME_TYPES);
export type ImageMimeType = z.infer<typeof imageMimeTypeSchema>;

export const IMAGE_EXTENSION_BY_MIME: Record<ImageMimeType, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Largest source image accepted by the API (15 MB). */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const sourceUploadResponseSchema = z.object({
  storageKey: z.string().min(1),
  mimeType: imageMimeTypeSchema,
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type SourceUploadResponse = z.infer<typeof sourceUploadResponseSchema>;

/**
 * The source image a redesign starts from. An `upload` describes an object the
 * API has stored; a `sample` points at an R2 room-type catalog image the API
 * materializes into runtime storage.
 */
export const generateSourceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("upload"),
    storageKey: z.string().min(1),
    mimeType: imageMimeTypeSchema,
    sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("sample"),
    id: z.string().min(1),
    imageUrl: z.string().url(),
  }),
]);

export type GenerateSource = z.infer<typeof generateSourceSchema>;

export const generateDesignSchema = z.object({
  source: generateSourceSchema,
  styles: z.array(z.string().min(1)).optional(),
  details: z.string().trim().max(500).optional(),
});

export type GenerateDesignInput = z.infer<typeof generateDesignSchema>;

/** Lifecycle of a redesign job. Values match the Prisma `GenerationStatus`. */
export const generationStatusSchema = z.enum([
  "pending",
  "queued",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export type GenerationStatus = z.infer<typeof generationStatusSchema>;

export const generateDesignResultSchema = z.object({
  generationId: z.string(),
  status: generationStatusSchema,
});

export type GenerateDesignResult = z.infer<typeof generateDesignResultSchema>;

export const generationOutputSchema = z.object({
  id: z.string(),
  /** The design style this render is for, when known. */
  styleCode: z.string().nullable(),
  imageUrl: z.string().url(),
});

export type GenerationOutput = z.infer<typeof generationOutputSchema>;

/**
 * A redesign job as GET /api/v1/generations/:id returns it. The results view
 * polls this until `status` is `completed` (or `failed`).
 */
export const generationDetailSchema = z.object({
  id: z.string(),
  status: generationStatusSchema,
  sourceImageUrl: z.string().url(),
  outputs: z.array(generationOutputSchema),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
});

export type GenerationDetail = z.infer<typeof generationDetailSchema>;

/**
 * A shoppable product surfaced under a render: the vision pass names a piece in
 * the image, then a shopping search resolves it to a real listing (photo, price,
 * retailer, buy link). `name`/`category` come from detection; the rest from the
 * matched product. Returned by GET /api/v1/generations/:id/products.
 */
export const shopProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  price: z.string().nullable(),
  source: z.string().nullable(),
  buyUrl: z.string().url(),
});

export type ShopProduct = z.infer<typeof shopProductSchema>;

/** At most this many items are detected per render (caps shopping lookups too). */
export const MAX_DETECTED_PRODUCTS = 8;

export const generationProductsSchema = z.object({
  products: z.array(shopProductSchema),
});

export type GenerationProducts = z.infer<typeof generationProductsSchema>;

/** Most element-edit regions accepted in a single apply. */
export const MAX_ELEMENT_EDITS = 10;

/**
 * A rectangle over the base image, normalized to `0..1` so it survives any
 * display size. The web canvas draws in these coordinates.
 */
export const elementEditRegionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export type ElementEditRegion = z.infer<typeof elementEditRegionSchema>;

/** One region plus the instruction describing how to change it. */
export const elementEditSchema = z.object({
  instruction: z.string().trim().min(1, "Instruction is required").max(500),
  region: elementEditRegionSchema,
});

export type ElementEdit = z.infer<typeof elementEditSchema>;

/**
 * Payload for POST /api/v1/generations/:id/edits. The base generated asset is
 * the generation in the URL; the body carries only the edits to apply to it.
 */
export const applyElementEditsSchema = z.object({
  edits: z.array(elementEditSchema).min(1).max(MAX_ELEMENT_EDITS),
});

export type ApplyElementEditsInput = z.infer<typeof applyElementEditsSchema>;
