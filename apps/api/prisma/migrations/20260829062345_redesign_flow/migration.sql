-- CreateEnum
CREATE TYPE "project_type" AS ENUM ('single_room', 'whole_house', 'place_it_yourself');

-- CreateEnum
CREATE TYPE "room_type_source" AS ENUM ('user', 'detected');

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_room_type_id_fkey";

-- AlterTable
ALTER TABLE "generations" ADD COLUMN     "additional_details" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "type" "project_type";

-- Existing projects predate workflow types and represent the single-room flow.
UPDATE "projects" SET "type" = 'single_room' WHERE "type" IS NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "room_type_source" "room_type_source",
ALTER COLUMN "room_type_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "generation_design_styles" (
    "generation_id" UUID NOT NULL,
    "design_style_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_design_styles_pkey" PRIMARY KEY ("generation_id","design_style_id")
);

-- Preserve the former room-level selections on every existing generation for
-- that room before removing the old join table.
INSERT INTO "generation_design_styles" ("generation_id", "design_style_id")
SELECT "generations"."id", "room_design_styles"."design_style_id"
FROM "generations"
INNER JOIN "room_design_styles"
  ON "room_design_styles"."room_id" = "generations"."room_id"
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "room_design_styles" DROP CONSTRAINT "room_design_styles_design_style_id_fkey";

-- DropForeignKey
ALTER TABLE "room_design_styles" DROP CONSTRAINT "room_design_styles_room_id_fkey";

-- DropTable
DROP TABLE "room_design_styles";

-- CreateIndex
CREATE INDEX "generation_design_styles_style_idx" ON "generation_design_styles"("design_style_id");

-- CreateIndex
CREATE INDEX "projects_owner_type_idx" ON "projects"("owner_id", "type");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_design_styles" ADD CONSTRAINT "generation_design_styles_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_design_styles" ADD CONSTRAINT "generation_design_styles_design_style_id_fkey" FOREIGN KEY ("design_style_id") REFERENCES "design_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
