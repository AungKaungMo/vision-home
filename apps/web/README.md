# web

VisionHome's Next.js 16 (App Router) front end. Part of the
[VisionHome monorepo](../../README.md) — run it from the repo root with
`pnpm dev` (web + API + worker) or on its own with `pnpm dev:web`.

Runs on **http://localhost:3001** and talks to the API at `NEXT_PUBLIC_API_URL`
(`lib/api/client.ts`; unset = same-origin relative requests — set it to
`http://localhost:4000` for local dev).

## Conventions

- **Feature-first.** Code lives under `feature/<domain>/` (`api/`, `components/`,
  `hooks/`, `lib/`, `constants.ts`), not by technical type. `app/` holds only
  route entry points; `(dashboard)` is the authed route group.
- **Auth** — Clerk (`@clerk/nextjs`).
- **Server state** — TanStack Query; query/mutation hooks in `feature/*/hooks/`.
- **Data access** — `lib/api/client.ts` (shared Axios instance; attaches the
  Clerk token, strips the `{ status, message, data }` envelope, rethrows a typed
  `ApiError`). Feature `api/*.ts` functions wrap it.
- **Contracts** — shared Zod schemas/types from `@repo/schemas`.
- **Forms** — `react-hook-form` + `@hookform/resolvers`; toasts via `sonner`;
  UI primitives in `components/ui/`, styled with Tailwind.

## Scripts

```bash
pnpm --filter web dev           # dev server on :3001
pnpm --filter web build         # production build
pnpm --filter web lint          # eslint --max-warnings 0
pnpm --filter web check-types   # next typegen && tsc --noEmit
```

See [`CLAUDE.md`](../../CLAUDE.md) for the full web + API architecture.
