-- Preserve each existing catalog image in the new multi-image column.
UPDATE "room_types"
SET "sample_image_keys" = array_append("sample_image_keys", "default_image_key")
WHERE "default_image_key" IS NOT NULL
  AND NOT ("default_image_key" = ANY ("sample_image_keys"));

-- AlterTable
ALTER TABLE "room_types" DROP COLUMN "default_image_key";
