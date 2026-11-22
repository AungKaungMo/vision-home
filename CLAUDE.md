# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

Turborepo + pnpm workspaces. Package names matter for filtering — the apps are **not** scoped:

- `apps/api` — package name **`api`** — Express 5 + Prisma 7 + TypeScript (ESM). Path alias `@/*` → `src/*`.
- `apps/web` — package name **`web`** — Next.js 16 App Router, React 19, TanStack Query, Clerk. Path alias `@/*` → repo-relative (`./*`).
- `packages/schemas` — **`@repo/schemas`** — shared Zod schemas + inferred types, the single source of truth for API/web contracts.
- `packages/ui` (`@repo/ui`), `packages/eslint-config`, `packages/typescript-config` — shared config/components.

## Commands

```bash
pnpm dev              # run all apps via turbo (web:3001, api:4000)
pnpm dev:api          # api only
pnpm dev:web          # web only
pnpm build            # turbo build (respects ^build dependency order)
pnpm lint             # turbo lint (eslint --max-warnings 0 everywhere)
pnpm check-types      # turbo check-types across the graph
pnpm format           # prettier --write

# Per-package (filter by the names above)
pnpm --filter api check-types      # prisma generate + tsc --noEmit
pnpm --filter web check-types      # next typegen + tsc --noEmit
pnpm --filter api test             # tsx --test tests/**/*.test.ts
pnpm --filter api exec tsx --test tests/foo.test.ts   # a single test file
```

### Database (run from `apps/api`, or `pnpm --filter api <script>`)

```bash
pnpm --filter api db:migrate   # prisma migrate dev (create + apply a migration)
pnpm --filter api db:deploy    # prisma migrate deploy (CI/prod)
pnpm --filter api db:reset     # drop, re-migrate, re-seed
pnpm --filter api db:seed      # runs prisma/seed.ts (design styles, room types)
pnpm --filter api db:studio
```

## Critical workflow: shared schemas resolve from `dist/`

`@repo/schemas` is consumed via its `exports` map pointing at `./dist/*.js` — **not** the `src/`. After editing anything under `packages/schemas/src/`, you **must** rebuild or both apps will typecheck/run against the stale contract:

```bash
pnpm --filter @repo/schemas build
```

Import subpaths directly: `import { generateDesignSchema } from "@repo/schemas/designs"`. Enum-like value arrays in schemas are the source of truth for the matching Prisma enums (e.g. `DESIGN_TYPES` ↔ `DesignType`, `generationStatusSchema` ↔ `GenerationStatus`) — keep them in sync by hand.

## API architecture (`apps/api/src`)

Layered, one direction: **router → middleware → handler → service → Prisma**. Never call Prisma from a handler; handlers validate + shape HTTP, services own data access.

- **Routing.** `app.ts` mounts `/api/v1` (via `api/v1/router.ts`) and, separately and *before* `express.json()`, `/api/v1/webhooks` (Clerk/Svix needs the raw body for signature verification). Each resource is a folder under `api/v1/<name>/` with `.router.ts` + `.handler.ts`.
- **Auth.** `clerkMiddleware()` is applied globally but does not require auth. Routes opt in with `requireUser` (`api/middleware/auth.middleware.ts`), which resolves the Clerk id to the local `User.id` and sets `request.userId`. **Handlers read `request.userId`, never the Clerk id.** Services take `ownerId` as their first arg and scope every query by it.
- **Response envelope.** Every `/api/v1` response is `{ status, message, data }` built with `success(data, message)` / `failure(message)` from `core/response.ts`. Web strips it via `res.data.data`.
- **Errors.** Throw `AppError` subclasses (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`) from `core/errors.ts`. The trailing `errorMiddleware` maps them to their status + `failure()` body; anything else becomes a logged 500. Handlers are plain `async` — no try/catch needed (Express 5 forwards rejected promises).
- **Validation.** `parseBody(schema, request.body)` and `parseUuidParam(value, resource)` from `core/validation.ts` throw `BadRequestError` on bad input. Validate UUID params before they reach Prisma (a non-UUID on a `@db.Uuid` column otherwise 500s).
- **Config.** `core/config.ts` parses `process.env` through a Zod schema at boot and exports a frozen `CONFIG`; an invalid env throws immediately. Read env only through `CONFIG`.

### Ports & adapters (hexagonal)

External providers sit behind ports so they can be faked. `ports/*.port.ts` define interfaces; `adapters/<provider>/` implement them (`fake.adapter.ts` + real, selected in `index.ts`). **Fake vs. real is driven by `CONFIG.USE_FAKE_ADAPTERS`, which defaults off `NODE_ENV`** — unset, it's `true` in dev/test and `false` in production; the env var `USE_FAKE_ADAPTERS=true|false` is an explicit override (staging runs as `NODE_ENV=production` but sets it `true` to test on fakes). When fakes are on, `app.ts` also serves local storage over HTTP (`/asset`, `/api/v1/dev-storage`).

- `adapters/clerk/` — reference adapter (webhook user sync).
- `adapters/image-generation/` — `fake` and `fal` only. `index.ts` selects purely on `CONFIG.USE_FAKE_ADAPTERS` (fake when on, else **`fal`**); there is no provider switch. **fal (`fal-ai/flux-kontext/dev`, via `adapters/fal/queue.ts`'s async-queue poller) is the working real provider** — needs `CONFIG.FAL_KEY`. The port exposes `submit(input)` (returns `{ providerRequestId, image: { styleCode, url } }`) and `edit(input)` for element edits. (Gemini and `IMAGE_GENERATION_PROVIDER` were removed.)
- `adapters/image-understanding/` — `fake` + `fal` behind `ports/image-understanding.port.ts`; `isInteriorRoom(url)` gates uploads/vision work. Real path also uses `FAL_KEY`.
- `adapters/storage/` — `r2` (real) + `fake` (local disk, served back via the `dev-storage` router).

Async redesign jobs use the `Generation` lifecycle (`GenerationStatus`: pending→queued→processing→completed/failed/cancelled), run by `worker.ts` + `workers/processors/redesign.processor.ts` over BullMQ. Note the worker fetches the render URL over HTTP, so with fakes it depends on the API serving `/asset` at `CONFIG.DEV_API_ORIGIN` (defaults to `http://localhost:4000`; set it to the public origin on any non-local fake deploy).

### Prisma specifics

- Client is generated to `src/generated/prisma/` (custom output, gitignored-style generated code) and imported from `@/generated/prisma/client`. `prisma generate` runs as part of `build` and `check-types`, so a fresh checkout needs it before typecheck passes.
- Uses the driver adapter `@prisma/adapter-pg` (`database/prisma.ts`), not the default engine.
- Config lives in `prisma.config.ts` (schema path, migrations dir, `seed` command), not in `package.json`.
- **Soft deletes:** most models have `deletedAt`; queries filter `deletedAt: null`. Ownership + soft-delete are enforced in the service layer, not the DB.

## Web architecture (`apps/web`)

- **Feature-first.** Code lives under `feature/<domain>/` (`api/`, `components/`, `hooks/`, `lib/`, `constants.ts`), not by technical type. `app/` holds only route entry points; `(dashboard)` is a route group.
- **Data fetching.** `lib/api/client.ts` is a shared Axios instance: an interceptor attaches the Clerk bearer token (registered once from `app/providers.tsx` via `setAuthTokenGetter`), and the response interceptor rethrows the envelope's error as a typed `ApiError`. Feature `api/*.ts` functions call it and strip the envelope (`.then((res) => res.data.data)`).
- **Server state = React Query.** Query hooks live in `feature/*/hooks/queries/`, keyed by tuples (e.g. `["designs", id]`) so calls dedupe. Mutations live alongside. Prefer deriving UI state from a fetched entity over threading it through props/URL params.
- Clerk (`@clerk/nextjs`) for auth; forms use `react-hook-form` + `@hookform/resolvers` with the shared Zod schemas; toasts via `sonner`.
- **Naming vs. routing.** The AI feature is branded **"AI Studio"** and lives at **`/ai-studio`** (`app/(dashboard)/ai-studio/`), but its code is still under `feature/ai-redesign/` — label/URL renamed, folder intentionally left. Dashboard nav is **Home · AI Studio · Profile** only.

## Product scope (portfolio)

Deliberately scoped small. **In:** single-room redesign, shop-these-products, plus Home and Profile. **Out (do not build / already cut):** place-it-yourself, sharing/publish, billing/subscription, whole-house, Explore, For You, Saved. The core domain entity is **`Design`** (formerly `Project` — fully renamed across schema, services, routes, and web).

## Redesign pipeline — build status

The single-room redesign flow is the primary vertical slice. Status (`[x]` done, `[~]` partial/WIP, `[ ]` not started):

**End-to-end single-room flow (user journey)**

- [x] Upload room photo (drag-drop + crop) — web `single-room/photo-upload.tsx`, `hooks/single-room/use-photo-upload.ts`
- [x] Store source upload — API `POST /designs/:id/assets/upload` → `design.service.storeSourceUpload` → storage adapter
- [x] Pick room type / sample room — web `room-type-picker.tsx`; API `GET /room-types`, `GET /room-types/:id`
- [x] Pick 1–3 design styles (+ optional details text) — web `style-picker.tsx`; API `GET /design-styles`
- [x] Submit generation — API `POST /designs/:id/generate` → `design.service.generateDesign` → enqueue via `generation-job.service` + BullMQ (`queues/generation.queue.ts`)
- [x] Worker processes job — `worker.ts` + `workers/processors/redesign.processor.ts` (calls image-gen port, persists outputs via `asset.service`, drives `GenerationStatus` pending→queued→processing→completed/failed)
- [x] Poll generation status — API `GET /generations/:id`; web `hooks/queries/use-generation.ts` (auto-refetch while running) + `generation-loading-overlay.tsx`. The failed state surfaces `errorMessage` (`redesign-results.tsx`).
- [x] View result + before/after slider — web `redesign-results.tsx`, `before-after-comparison.tsx`
- [x] Regenerate — API `POST /generations/:id/regenerate`; web `use-regenerate-generation.ts`
- [x] Element editing — full UI (draw/move/resize regions + per-edit instructions) **and** backend: API `POST /assets/:id/edits` → `element-edit.service.ts` (produces a new generation); web `element-editor.tsx` → `onApplied` swaps the results view to the edited generation.
- [x] Shop these products — lazy, cached per generation. `image-understanding.detectProducts` runs **florence-2 object-detection** (grounded, so it won't invent furniture for an empty room) → `{name, category}`; each is resolved to a real listing via the `product-search` port (**Serper.dev** Google Shopping, needs `SERPER_API_KEY`). API `GET /generations/:id/products` → `generation.service.getGenerationProducts` caches to `Generation.products`. Web `shop-this-look.tsx` + `use-generation-products.ts` + `product-card.tsx` (photo/price/retailer/buy link). Panel hides when nothing shoppable is found.
- Place-it-yourself flow — **cut** (removed from web; `place_it_yourself` `DesignType`/enum value already dropped in migration `20261114000000`).

**Infrastructure & cross-cutting**

- [x] Prisma schema — pipeline models defined (`User`, `Design`, `Room`, `RoomType`, `DesignStyle`, `Asset`, `Generation`, `GenerationDesignStyle`) + enums (`DesignType`, `DesignStatus`, `DesignSource`, `AssetType`, `GenerationStatus`, …).
- [x] Storage port + adapters — R2 (`adapters/storage/r2.adapter.ts`) and fake/local both complete.
- [x] Clerk auth — webhook user sync + `requireUser` middleware complete.
- [x] Queue infra — BullMQ + Redis, processor, worker events all complete.
- [x] **Real image generation works via fal** (`adapters/image-generation/fal.adapter.ts`, FLUX Kontext over `adapters/fal/queue.ts`). Selected automatically whenever `USE_FAKE_ADAPTERS=false`; requires `FAL_KEY`. Fakes return `/asset/img/default.webp` — if you still see that with fakes off, the worker process hasn't re-read `.env` (restart `dev:worker`).
- [x] **Is-room detection works via fal** (`adapters/image-understanding/fal.adapter.ts`, `isInteriorRoom`) — gates non-interior uploads; groundwork for shop-these-products.

## Comments

Comment the **why**, not the **what**. Reserve comments for non-obvious decisions, gotchas, and constraints the code can't express on its own — the way the existing code explains why webhooks mount before `express.json()`, why `errorMiddleware` must keep its fourth param, or why a UUID param is validated before Prisma. Don't narrate self-evident code, restate the function name, or leave placeholder/TODO noise. If the logic is straightforward, no comment. Match the surrounding density — don't add a comment to every line.
