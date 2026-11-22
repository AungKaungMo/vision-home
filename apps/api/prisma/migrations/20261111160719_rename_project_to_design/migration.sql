/*
  Warnings:

  - You are about to drop the column `project_id` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `design_id` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "design_status" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "design_visibility" AS ENUM ('private', 'unlisted', 'public');

-- CreateEnum
CREATE TYPE "design_type" AS ENUM ('single_room', 'place_it_yourself');

-- CreateEnum
CREATE TYPE "design_source" AS ENUM ('generated', 'edited');

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_project_id_fkey";

-- DropIndex
DROP INDEX "rooms_project_created_idx";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "project_id",
ADD COLUMN     "design_id" UUID NOT NULL;

-- DropTable
DROP TABLE "projects";

-- DropEnum
DROP TYPE "project_status";

-- DropEnum
DROP TYPE "project_type";

-- DropEnum
DROP TYPE "project_visibility";

-- CreateTable
CREATE TABLE "designs" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "type" "design_type" NOT NULL,
    "source" "design_source" NOT NULL DEFAULT 'generated',
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "status" "design_status" NOT NULL DEFAULT 'draft',
    "visibility" "design_visibility" NOT NULL DEFAULT 'private',
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "designs_owner_updated_idx" ON "designs"("owner_id", "updated_at");

-- CreateIndex
CREATE INDEX "designs_owner_type_idx" ON "designs"("owner_id", "type");

-- CreateIndex
CREATE INDEX "designs_visibility_created_idx" ON "designs"("visibility", "created_at");

-- CreateIndex
CREATE INDEX "rooms_design_created_idx" ON "rooms"("design_id", "created_at");

-- AddForeignKey
ALTER TABLE "designs" ADD CONSTRAINT "designs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
