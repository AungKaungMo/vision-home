# VisionHome API

## Generation worker

Image generation jobs use BullMQ with Redis. Local development expects Redis at
`redis://localhost:6379`, matching `docker-compose.yml` and `.env.example`.

Running `pnpm dev` from the repository root starts the API and generation worker
as separate Turbo tasks. To run them individually:

```bash
pnpm --filter api dev
pnpm --filter api dev:worker
```

Production builds include both entry points. Run the worker with:

```bash
pnpm --filter api start:worker
```

## Clerk webhook sync

The public Clerk webhook endpoint is:

```text
POST /api/v1/webhooks/clerk
```

Configure a Clerk Dashboard webhook endpoint with these events:

- `user.created`
- `user.updated`
- `user.deleted`
- `session.created`

Copy `.env.example` to `.env`, then set `CLERK_WEBHOOK_SIGNING_SECRET` to the
endpoint's signing secret. The older `CLERK_WEBHOOK_SECRET` name is temporarily
accepted for existing local environments. For local testing, expose port `4000`
with a tunnel and use:

```text
https://your-tunnel.example/api/v1/webhooks/clerk
```

Apply the database migrations before receiving events:

```bash
pnpm --filter api db:deploy
```

Webhook requests are signature-verified before any database write. User create
and update deliveries use an upsert, so Clerk retries do not create duplicate
users.
