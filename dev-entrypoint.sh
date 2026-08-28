#!/bin/sh
# Dev container entrypoint.
#
# Runs at container START (not image build) on purpose: the `.:/app` bind mount
# in docker-compose shadows anything baked into the image layer, so build output
# and a generated Prisma client only survive if produced here, after the mount.
set -e

# Build workspace libraries that ship compiled output. @repo/schemas is consumed
# from its dist/, which won't exist on a fresh clone until it's built.
# (@repo/ui is source-only and transpiled by Next, so it needs no build.)
echo "==> Building workspace libraries..."
pnpm turbo build --filter=@repo/schemas

# API-only: make sure the Prisma client exists and the DB schema is up to date
# before the server boots.
if [ "$TARGET_APP" = "api" ]; then
  echo "==> Generating Prisma client..."
  pnpm --filter api run db:generate

  echo "==> Applying database migrations..."
  pnpm --filter api run db:deploy
fi

echo "==> Starting '$TARGET_APP' dev server..."
exec pnpm turbo dev --filter="$TARGET_APP"
