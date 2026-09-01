import { z } from "zod";

/** Project workflow types. Values match the Prisma `ProjectType` enum. */
export const PROJECT_TYPES = [
  "single_room",
  "whole_house",
  "place_it_yourself",
] as const;

export const projectTypeSchema = z.enum(PROJECT_TYPES);
export type ProjectType = z.infer<typeof projectTypeSchema>;

/** Project lifecycle states. Values match the Prisma `ProjectStatus` enum. */
export const PROJECT_STATUSES = ["draft", "active", "archived"] as const;

export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

/**
 * Payload for POST /api/v1/projects. Shared by the API and web app.
 *
 * Room type is optional and either a known `roomTypeId` OR a hand-typed
 * `roomTypeLabel` — never both.
 */
export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    description: z.string().trim().max(500).optional(),
    type: projectTypeSchema,
    roomTypeId: z.string().uuid().optional(),
    roomTypeLabel: z.string().trim().min(1).max(100).optional(),
  })
  .refine((value) => !(value.roomTypeId && value.roomTypeLabel), {
    message: "Provide either a room type or a custom label, not both",
    path: ["roomTypeLabel"],
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const projectRoomSchema = z.object({
  id: z.string(),
  roomTypeId: z.string().nullable(),
  roomTypeLabel: z.string().nullable(),
});

export type ProjectRoom = z.infer<typeof projectRoomSchema>;

/**
 * A project returned by POST /api/v1/projects and GET /api/v1/projects/:id.
 * The create page reads its title/description (and room) from here rather than
 * carrying them through the URL.
 */
export const projectDetailSchema = z.object({
  id: z.string(),
  type: projectTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  room: projectRoomSchema.nullable(),
  latestGenerationId: z.string().nullable(),
});

export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export const projectListItemSchema = z.object({
  id: z.string(),
  type: projectTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  status: projectStatusSchema,
  updatedAt: z.string(),
  generatedImageUrl: z.string().url().nullable(),
});

export type ProjectListItem = z.infer<typeof projectListItemSchema>;

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
