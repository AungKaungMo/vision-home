-- AlterTable
ALTER TABLE "assets" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "generations" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "room_types" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
