-- AlterTable
ALTER TABLE "room_types" ADD COLUMN     "sample_image_keys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
