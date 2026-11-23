/*
  Warnings:

  - The values [place_it_yourself] on the enum `design_type` will be removed.
    This is safe only while no `designs` row uses that type (the flow was
    removed before any such design could be created).

*/
-- AlterEnum
BEGIN;
CREATE TYPE "design_type_new" AS ENUM ('single_room');
ALTER TABLE "designs" ALTER COLUMN "type" TYPE "design_type_new" USING ("type"::text::"design_type_new");
ALTER TYPE "design_type" RENAME TO "design_type_old";
ALTER TYPE "design_type_new" RENAME TO "design_type";
DROP TYPE "design_type_old";
COMMIT;
