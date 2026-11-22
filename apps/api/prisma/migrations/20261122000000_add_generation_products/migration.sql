-- Lazily-computed "shop this look" products cached per generation (null = not detected yet).
ALTER TABLE "generations" ADD COLUMN "products" JSONB;
