-- DropIndex
DROP INDEX "design_styles_active_sort_idx";

-- AlterTable
ALTER TABLE "design_styles" DROP COLUMN "default_image_key",
DROP COLUMN "description",
DROP COLUMN "sort_order";

-- CreateTable
CREATE TABLE "room_design_styles" (
    "room_id" UUID NOT NULL,
    "design_style_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_design_styles_pkey" PRIMARY KEY ("room_id","design_style_id")
);

-- CreateIndex
CREATE INDEX "room_design_styles_style_idx" ON "room_design_styles"("design_style_id");

-- CreateIndex
CREATE INDEX "design_styles_active_idx" ON "design_styles"("is_active");

-- AddForeignKey
ALTER TABLE "room_design_styles" ADD CONSTRAINT "room_design_styles_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_design_styles" ADD CONSTRAINT "room_design_styles_design_style_id_fkey" FOREIGN KEY ("design_style_id") REFERENCES "design_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

