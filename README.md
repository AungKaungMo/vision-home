# VisionHome

AI interior-design studio. Upload a photo of a room, pick design styles, and get
an AI-generated redesign — then refine individual elements, place catalog items
yourself, and shop the look.

This is a portfolio project, deliberately scoped to a few deep features rather
than a broad product. See [`CLAUDE.md`](./CLAUDE.md) for the full architecture
and current build status.

## Stack

- **Monorepo** — Turborepo + pnpm workspaces
- **Web** (`apps/web`) — Next.js 16 App Router, React 19, TanStack Query, Clerk, Tailwind
- **API** (`apps/api`) — Express 5, Prisma 7 (Postgres), BullMQ worker, TypeScript (ESM)
- **Shared** — `@repo/schemas` (Zod contracts), `@repo/ui`, shared ESLint/TS config
- **External** — Clerk (auth), Google Gemini (image generation), Cloudflare R2 (storage), Redis (queue)

External providers sit behind ports/adapters and can be faked, so the whole app
runs end-to-end locally without any provider keys (`USE_FAKE_ADAPTERS`, which
defaults to fakes outside production).

## Monorepo layout

```
apps/
  web/        # Next.js app (package name: web)        → localhost:3001
  api/        # Express API + generation worker (api)  → localhost:4000
packages/
  schemas/    # @repo/schemas — Zod schemas + types, the API/web contract
  ui/         # @repo/ui — shared React components
  eslint-config, typescript-config
```

## Prerequisites

- Node >= 20, pnpm 9 (`corepack enable`)
- Docker (for Postgres + Redis), or your own Postgres/Redis

## Getting started

```bash
pnpm install

# 1. Start Postgres + Redis via Docker
docker compose up -d postgres redis

# 2. Configure env — the API parses process.env through a Zod schema at boot.
#    apps/api/src/core/config.ts is the source of truth for required/optional vars.
#    At minimum: DATABASE_URL, REDIS_URL, and Clerk keys. Leave USE_FAKE_ADAPTERS
#    unset in dev to run with fake providers (no Gemini/R2 keys needed).

# 3. Set up the database
pnpm --filter api db:migrate
pnpm --filter api db:seed      # seeds design styles + room types

# 4. Run everything (web, api, worker)
pnpm dev
```

Web runs on **http://localhost:3001**, API on **http://localhost:4000**.

The full stack is also containerized — `docker compose up` brings up Postgres,
Redis, the API, the generation worker, and the web app together.

## Common commands

```bash
pnpm dev              # all apps + worker via turbo
pnpm dev:api          # API only
pnpm dev:web          # web only
pnpm build            # build everything (respects dependency order)
pnpm lint             # eslint --max-warnings 0 across the graph
pnpm check-types      # typecheck across the graph
pnpm format           # prettier --write

# Database (from apps/api, or `pnpm --filter api <script>`)
pnpm --filter api db:migrate   # create + apply a migration
pnpm --filter api db:reset     # drop, re-migrate, re-seed
pnpm --filter api db:studio    # Prisma Studio
```

> After editing anything under `packages/schemas/src/`, rebuild it
> (`pnpm --filter @repo/schemas build`) — both apps consume its compiled `dist/`.

## Architecture

The API is layered **router → middleware → handler → service → Prisma**, with a
`{ status, message, data }` response envelope and hexagonal ports/adapters for
external providers. The web app is feature-first (`feature/<domain>/`) with
React Query for server state. Full details, conventions, and the redesign
pipeline's build status live in [`CLAUDE.md`](./CLAUDE.md).
