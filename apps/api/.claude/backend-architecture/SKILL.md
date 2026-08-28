---
name: backend-architecture
description: >-
  Architecture, stack, and conventions for the AI room-redesign app backend — a
  Fastify + BullMQ modular monolith (TypeScript) that turns a room photo into an
  AI redesign with shoppable, affiliate-linked products. Consult this BEFORE
  writing any backend code: adding routes, BullMQ queues/workers, Prisma models,
  or Zod schemas; integrating AI / payment / affiliate / storage vendors; wiring
  Clerk auth; or making any structural decision. Use it even when the request
  looks like "just a small route" — the no-slow-work-in-a-request rule and the
  ports-and-adapters boundaries are easy to violate by accident and expensive to
  unwind later.
---

# Backend Architecture

## What this project is

A mobile-first app: the user uploads a room photo, AI generates a redesigned
room, real buyable products are matched to the items in that design, and users
can later share designs and earn affiliate commission. This skill governs the
**backend** (Node.js + TypeScript). Keep it aligned with the decisions below
rather than defaulting to a conventional tutorial-style Express app.

## The stack (use these, not substitutes)

- **API**: Fastify (TypeScript). Use NestJS only if a heavier, opinionated
  structure is explicitly wanted; default to Fastify (lighter, faster).
- **Validation**: Zod for request/response and env validation. TypeScript for
  static types. Validate at the API boundary; trust types inside.
- **ORM/migrations**: Prisma (`prisma/schema.prisma` + `prisma migrate`).
- **DB**: PostgreSQL with the `pgvector` extension. Vector similarity queries go
  through Prisma `$queryRaw` (raw SQL) — Prisma's typed API doesn't cover them.
- **Jobs**: BullMQ + Redis.
- **HTTP / AI SDKs**: native `fetch` / `undici`, plus `@fal-ai/client`,
  `replicate`, `@google/genai`.
- **ML**: called via hosted APIs (fal / Replicate / Gemini). If ML is ever
  brought in-house, isolate it in a small Python microservice behind the
  relevant port — do not pull a model runtime into the Node process.
- **Images**: `sharp` for crop/resize/compositing.
- **Storage**: Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3`.
- **Auth**: Clerk, verified on the backend (`@clerk/backend` / `@clerk/fastify`).
- **Subscriptions**: RevenueCat (webhook-driven).
- **Tooling**: pnpm, `tsx` (run/watch), Vitest (tests), ESLint + Prettier,
  Docker / docker-compose.

Prefer `pnpm add <pkg>` over editing package.json by hand. Do not introduce a
new dependency for something already covered above without flagging it.

## Core pattern: modular monolith + selective ports & adapters

One deployable API process + one BullMQ worker process. Organize code by
**feature module**, not by technical layer.

Apply ports & adapters (a TypeScript `interface` + swappable implementation)
**only at volatile external boundaries** — the vendors most likely to change:

- `ImageGenerationPort` (depth, segmentation, generate)
- `ObjectDetectionPort`
- `EmbeddingPort`
- `VectorSearchPort`
- `StoragePort`
- `EntitlementPort` (subscription state)
- `AffiliatePort` (later phase)

Everywhere else — your own domain logic, route handling, DB access via Prisma —
keep it plain and direct. **Do not** wrap non-volatile internals (your own
services, simple CRUD) in interfaces. Over-abstraction is as much a defect here
as hardcoding a vendor. The test for "does this deserve a port?" is: *would
swapping the provider behind it be a realistic future event?* AI and commerce
vendors: yes. Your own user service: no.

Domain logic must depend on the **port interface**, never on `@fal-ai/client`,
`@google/genai`, `@aws-sdk/*`, `@clerk/*`, etc. directly. If a provider SDK is
imported inside a feature module's logic, that's a bug — move it into an adapter.

## The no-slow-work-in-a-request rule (most important, easiest to break)

Node is single-threaded per process, so two distinct hazards apply:

- **No slow I/O in a request.** AI generation, detection, and embedding take
  seconds. A route that triggers them must: create a job row, enqueue a BullMQ
  job, and return a `jobId` immediately. The client polls a status route (or
  receives a websocket push). Never `await` a generation call inside a route
  handler.
- **No heavy CPU in the API process.** Image processing (`sharp`), embedding
  math, or any CPU-bound loop will block the event loop and stall *every*
  in-flight request. Push that work to the **BullMQ worker**, which runs as a
  separate process.

If you're about to call an AI provider or do `sharp` work inside a route
handler, stop and move it into a worker job instead.

## Fake-adapter-first development

Every port ships with **two adapters: a real one and a fake one.** The fake
returns plausible canned data (e.g. a placeholder image URL after a short
delay). An env flag selects which is used.

This lets the entire async flow — route → job → worker → status — be built and
tested with zero vendor accounts and zero cost. Build and verify against fakes
first; swap in real adapters slice by slice. When adding a new external
capability, write the port and its fake **before** the real implementation.

Tests must not hit real vendors — inject fake adapters.

## Auth conventions (Clerk)

Clerk is **frontend-led**: the mobile app handles login and issues tokens. The
backend never runs login screens or stores passwords. The backend does two
things only:

1. **Verify** — a single helper / Fastify decorator `getCurrentUser` validates
   the Clerk RS256 JWT (networkless, against the cached JWKS) using
   `@clerk/backend`, and returns the *internal* `User`. Protected routes go
   through it (e.g. a `preHandler`). This is the auth seam — swapping providers
   means changing only it.
2. **Sync** — on first authenticated request, create the local user from the
   token's `sub` claim (just-in-time). A Svix-verified `POST /webhooks/clerk`
   route keeps users in sync later (defer until the core loop works).

The `User` model stores `clerkUserId` (the `sub` claim) as an external
reference; all domain tables relate to the internal user id, never to Clerk's.
For local dev/tests, override `getCurrentUser` to return a fake user — do not
weaken the real verification path with "skip signature" shortcuts.

## Domain & data conventions

- Keep **Prisma models** (persistence) and **Zod schemas** (the API contract)
  separate. Don't leak Prisma row types straight out of the API.
- Type everything; let TypeScript + Zod + Prisma's generated types do the work.
- Keep vendor identifiers and vendor-shaped payloads at the adapter edge. Domain
  code speaks in internal types only.
- Keep API response schemas stable and accurate — the React Native app shares
  these types, so a change here is a change to the client contract.

## Folder structure

```
prisma/
  schema.prisma        # models + migrations
src/
  server.ts            # Fastify app, plugin + route registration
  config/              # env loading + Zod validation, constants
  core/                # getCurrentUser (auth seam), error handling, DI wiring
  routes/              # routes by feature: designs, products, social, webhooks
  services/            # domain logic (calls ports, never SDKs)
  ports/               # TypeScript interfaces
  adapters/            # real + fake implementation per port
  workers/             # BullMQ queues + worker processors (separate entry point)
  schemas/             # Zod request/response schemas
  db/                  # Prisma client singleton
tests/
```

New external integration → add the `interface` in `ports/`, a fake + real impl
in `adapters/`, and wire it via dependency injection. New feature → its own
routes in `routes/` and logic in `services/`. The worker has its own entry point
(`workers/`) and is deployed as a separate process from the API.

## Phase discipline

Build **Phase 1 only** unless asked otherwise: sign-in, upload photo → create
redesign job, poll status, return result with matched shoppable products, and
entitlement checks. **Defer** the social feed, creator payouts, object-level
edit, and whole-house project mode. Do not scaffold or "prepare for" deferred
features speculatively — add the seam (e.g. `AffiliatePort`) only when that
phase starts.

## Anti-patterns (reject these)

- Calling an AI / storage / payment SDK directly from a route or service → use a
  port + adapter.
- `await`-ing generation inside a route handler → enqueue a BullMQ job, return
  `jobId`.
- Heavy `sharp` / CPU work in the API process → move it to the worker; it blocks
  the event loop.
- Wrapping your own internal services in interfaces "for symmetry" → only
  volatile vendor boundaries get ports.
- Leaking Prisma types as the API response → map through a Zod-typed schema.
- Secrets in code → env via Zod-validated config; `.env` gitignored, keep a
  checked-in `.env.example`.
- Tests hitting real vendors → use fake adapters / DI.
- Building deferred-phase features ahead of time.