# VisionHome

AI interior-design studio. Upload a photo of a room, pick design styles, and get
an AI-generated redesign — then refine individual elements, regenerate, and shop
the look (real products detected in the render).

This is a portfolio project, deliberately scoped to a few deep features rather
than a broad product. See [`CLAUDE.md`](./CLAUDE.md) for the full architecture
and current build status.

## Features

- **Generate** — upload a room photo, pick a room type + 1–3 design styles, get
  an AI redesign (fal / FLUX Kontext), processed async on a worker.
- **Edit element** — draw/move/resize regions and give per-edit instructions to
  refine part of a render into a new generation.
- **Regenerate** — re-run a generation with the same inputs.
- **Shop the look** — a vision pass (florence-2 object detection) finds the
  furniture actually in the render, then Serper.dev resolves each to a real
  shopping listing (photo, price, retailer, buy link).

## Stack

- **Monorepo** — Turborepo + pnpm workspaces
- **Web** (`apps/web`) — Next.js 16 App Router, React 19, TanStack Query, Clerk, Tailwind
- **API** (`apps/api`) — Express 5, Prisma 7 (Postgres), BullMQ worker, TypeScript (ESM)
- **Shared** — `@repo/schemas` (Zod contracts), `@repo/ui`, shared ESLint/TS config
- **External** — Clerk (auth), fal (image generation + understanding), Serper.dev (product search), Cloudflare R2 (storage), Redis (queue)

External providers sit behind ports/adapters and can be faked, so the whole app
runs end-to-end locally **without any provider keys** — `USE_FAKE_ADAPTERS`
defaults to fakes outside production.

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

- **Node** >= 20 and **pnpm** 9 (`corepack enable`)
- **Docker** (for Postgres + Redis) — or bring your own Postgres/Redis
- A **Clerk** application (free) for auth keys — required even in fake-adapter mode

## Quick start (local dev)

Runs the apps on your host, with only Postgres + Redis in Docker.

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres + Redis
docker compose up -d postgres redis

# 3. Create env files (see "Environment" below)
#    apps/api/.env  and  apps/web/.env.local

# 4. Set up the database
pnpm --filter api db:migrate   # create + apply migrations
pnpm --filter api db:seed      # seed design styles + room types

# 5. Run web + API + worker together
pnpm dev
```

- Web → **http://localhost:3001**
- API → **http://localhost:4000**

`pnpm dev` also starts the **generation worker** — a separate process that pulls
redesign jobs off the BullMQ queue and runs the image pipeline. Without it,
generations are enqueued but never processed (they stay `queued` forever). Run
it on its own with `pnpm --filter api dev:worker`.

With `USE_FAKE_ADAPTERS` unset (the dev default), image generation, product
search, and storage all use local fakes — no fal / Serper / R2 keys needed. The
only keys you must provide are **Clerk** (auth can't be faked).

## Environment

The API parses `process.env` through a Zod schema at boot
(`apps/api/src/core/config.ts` is the source of truth) and throws on anything
invalid. Read env only through the exported `CONFIG`.

### `apps/api/.env`

| Variable | Required? | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | **yes** | — | `postgresql://roomapp:localdev@localhost:5432/vision-home?schema=public` for the Docker Postgres |
| `CLERK_SECRET_KEY` | **yes** | — | `sk_test_…` |
| `CLERK_PUBLISHABLE_KEY` | **yes** | — | `pk_test_…` |
| `CLERK_WEBHOOK_SIGNING_SECRET` | **yes** | — | from the Clerk webhook endpoint (`whsec_…`) |
| `REDIS_URL` | no | `redis://localhost:6379` | |
| `PORT` | no | `4000` | |
| `NODE_ENV` | no | `development` | |
| `CORS_ORIGIN` | no | `http://localhost:3001` | comma-separated list allowed |
| `USE_FAKE_ADAPTERS` | no | `true` in dev/test, `false` in prod | explicit `true`/`false` overrides |
| `DEV_API_ORIGIN` | no | `http://localhost:4000` | public origin the worker fetches fake assets from |
| `FAL_KEY` | if fakes off | — | real image generation + understanding ([fal.ai](https://fal.ai)) |
| `SERPER_API_KEY` | for shop-the-look | — | real product search ([serper.dev](https://serper.dev), 2,500 free credits) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_URL` | if fakes off | — | Cloudflare R2 storage |

### `apps/web/.env.local`

| Variable | Required? | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **yes** | `http://localhost:4000` (unset = same-origin relative requests) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **yes** | `pk_test_…` |
| `CLERK_SECRET_KEY` | **yes** | `sk_test_…` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | no | `/auth/sign-in` (match the app's auth routes) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | no | `/auth/sign-up` |
| `NEXT_PUBLIC_R2_URL` | no | public R2 URL — only needed to show R2-hosted sample room images |

> Clerk auth is required even with fake adapters. Create a free app at
> [clerk.com](https://clerk.com), copy the publishable/secret keys, and (for user
> sync) add a webhook to the API's `/api/v1/webhooks/clerk` endpoint and copy its
> signing secret into `CLERK_WEBHOOK_SIGNING_SECRET`.

## Database

```bash
pnpm --filter api db:migrate   # prisma migrate dev — create + apply a migration
pnpm --filter api db:deploy    # prisma migrate deploy — apply in CI/prod
pnpm --filter api db:seed      # seed design styles + room types
pnpm --filter api db:reset     # drop, re-migrate, re-seed
pnpm --filter api db:studio    # Prisma Studio
```

## Common commands

```bash
pnpm dev              # all apps + worker via turbo (web:3001, api:4000)
pnpm dev:api          # API only
pnpm dev:web          # web only
pnpm --filter api dev:worker   # generation worker only
pnpm build            # build everything (respects dependency order)
pnpm lint             # eslint --max-warnings 0 across the graph
pnpm check-types      # typecheck across the graph
pnpm format           # prettier --write
pnpm --filter api test   # api test suite (tsx --test)
```

> After editing anything under `packages/schemas/src/`, rebuild it
> (`pnpm --filter @repo/schemas build`) — both apps consume its compiled `dist/`.

## Full Docker stack

The whole stack is containerized (`docker-compose.yml` + `dev.Dockerfile`) —
Postgres, Redis, the API, the generation worker, and the web app:

```bash
docker compose up            # build + run everything
docker compose up -d postgres redis   # just the datastores (for local dev)
```

The API/worker containers point `DATABASE_URL`/`REDIS_URL` at the service names
and still read `apps/api/.env` for everything else (keys, `USE_FAKE_ADAPTERS`).

## Architecture

The API is layered **router → middleware → handler → service → Prisma**, with a
`{ status, message, data }` response envelope and hexagonal ports/adapters for
external providers (each has a `fake` and a real implementation). The web app is
feature-first (`feature/<domain>/`) with React Query for server state. Full
details, conventions, and the redesign pipeline's build status live in
[`CLAUDE.md`](./CLAUDE.md).
