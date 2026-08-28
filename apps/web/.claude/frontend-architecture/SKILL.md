---
name: frontend-architecture
description: >-
  Architecture, stack, and conventions for the AI room-redesign app's React
  Native (Expo) mobile frontend. Built on feature-based modules with a strict
  split between server state (TanStack Query) and client/UI state (Zustand),
  Expo Router for navigation, and Clerk for auth. Consult this BEFORE writing
  any frontend code: adding screens, data fetching, mutations, stores,
  navigation, or wiring auth and API calls. Use it even when the task looks like
  "just a simple screen" — the server-state-vs-client-state boundary and the
  feature-module layout are the two rules most easily violated, and putting API
  data in Zustand or hand-rolling fetch + useEffect is exactly the drift this
  prevents.
---

# Frontend Architecture

## What this project is

The mobile client for an app where users upload a room photo, get an AI
redesign, see shoppable products matched to it, and later share designs. This
skill governs the **React Native (Expo) frontend**. Keep it aligned with the
decisions below rather than defaulting to tutorial patterns
(`useState` + `useEffect` + `fetch`, global state dumping grounds, etc.).

## The stack (use these, not substitutes)

- **Runtime/UI**: React Native + Expo, TypeScript
- **Navigation**: Expo Router (file-based)
- **Server state**: TanStack Query (React Query) — everything from the API
- **Client/UI state**: Zustand — only local/UI state
- **Auth**: Clerk Expo SDK (`@clerk/clerk-expo`)
- **API types**: a TypeScript client generated from the backend's OpenAPI spec
- **HTTP**: `fetch`, wrapped once to attach the Clerk token

## Core rule: server state vs client state (the one that matters most)

Split state by **where it lives**, not by how it feels:

- **Server state → TanStack Query.** Anything that comes from or is owned by the
  backend: designs, a design's job status, matched products, the social feed,
  the user's entitlement. Never copy this into a Zustand store. TanStack Query is
  the single source of truth for server data — it owns caching, loading/error
  state, refetching, and invalidation.
- **Client/UI state → Zustand.** Only things the server doesn't own: the current
  selection in the editor, a modal's open/closed flag, a multi-step form's
  progress, theme. Keep stores small and UI-specific.

The most common and most damaging mistake is fetching API data and stashing it
in Zustand (or `useState`) and then manually syncing it. Don't. If the data has
a server origin, it goes through a query hook. If you find yourself writing
`useEffect(() => { fetch(...).then(setState) }, [])`, stop and write a query
hook instead.

## Data-fetching patterns

- **Queries** live in the feature's `queries/` folder as hooks (`useDesigns`,
  `useDesign(id)`, `useFeed`). Components call the hook; they never call `fetch`.
- **Polling the redesign job** uses TanStack Query's `refetchInterval`: poll
  `GET /designs/:id` on a short interval and **stop when `status === "done"`**
  (return `false` from `refetchInterval` once done). This is the core
  upload→result UX; don't hand-roll a polling loop.
- **Infinite feed** uses `useInfiniteQuery` for the social feed pagination.
- **Mutations** (upload a photo, like a post) use `useMutation`, and on success
  **invalidate** the affected queries so the UI refreshes from server truth
  rather than being patched by hand.
- **Query keys** are hierarchical and consistent, e.g. `["designs"]`,
  `["designs", id]`, `["feed"]`. Centralize key builders so invalidation is
  reliable.

## Auth (Clerk)

Use the Clerk Expo SDK for sign-in/up and session — do not build login UI by
hand or store tokens yourself. Wrap the app in Clerk's provider; gate routes
with Clerk's auth state via Expo Router layouts (an authenticated group vs a
public group). The API wrapper pulls the current Clerk token and attaches it as
`Authorization: Bearer <token>` on every request — that's the only place token
handling lives.

## The typed API client

Generate the API client/types from the backend's OpenAPI spec; do **not**
hand-write request/response types. When the backend contract changes, regenerate
— TypeScript will then flag every call site that no longer matches. This keeps
the mobile app and backend in lockstep and is the main payoff of a typed stack
end to end.

## Component conventions

- Components are presentational. Data comes from query hooks; actions come from
  mutation hooks; UI state comes from Zustand or local `useState`.
- No `fetch` calls, business logic, or API URLs inside components.
- Keep shared, dumb UI primitives in `src/components/`; anything feature-specific
  lives inside that feature.

## Folder structure (feature-based modules)

```
app/                      # Expo Router routes — thin, import from features
  _layout.tsx
  (auth)/                 # public group (sign in / up)
  (app)/                  # authenticated group
    index.tsx             # gallery
    upload.tsx
    design/[id].tsx       # result + polling screen
src/
  features/
    designs/
      components/
      queries/            # useDesigns, useDesign (polling), useCreateDesign
      store/              # zustand: e.g. upload/editor UI state
      types.ts
    products/
    social/
    auth/
  lib/
    api/                  # generated client + fetch wrapper (attaches token)
    query/                # queryClient + query-key helpers
  stores/                 # only truly app-wide UI stores
  components/             # shared dumb UI primitives
```

New feature → its own folder under `features/` with its screens, query hooks,
and (if needed) a small store. New route → a thin file under `app/` that renders
a feature's screen.

## Phase discipline

Build **Phase 1 screens only** unless asked otherwise: auth, upload, the
result/polling screen, and the gallery. **Defer** the social feed, the
object-level editor, and whole-house project UI. Don't scaffold deferred screens
speculatively.

## Anti-patterns (reject these)

- Putting server/API data in Zustand or `useState` → use a TanStack Query hook.
- `useEffect` + `fetch` for server data → use a query hook.
- Hand-rolling a polling loop for job status → use `refetchInterval` and stop at
  `done`.
- Hand-writing API response types → generate them from the backend OpenAPI spec.
- Storing the Clerk token manually → let the Clerk SDK + API wrapper handle it.
- Global `screens/`, `hooks/`, `components/` dumping grounds → organize by
  feature.
- `fetch` calls or business logic inside components → move to query/mutation
  hooks.
- Building deferred-phase screens ahead of time.