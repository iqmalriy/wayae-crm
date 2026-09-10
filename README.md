# wayae-crm

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge "MIT License")][license]
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white "Next.js")][next]
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black "React")][react]
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white "TypeScript")][typescript]
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white "PostgreSQL")][postgres]
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-1.0%20RC-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black "Drizzle ORM")][drizzle]
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D11-F69220?style=for-the-badge&logo=pnpm&logoColor=white "pnpm")][pnpm]

A WhatsApp CRM built with Next.js. It is a full-stack app: the dashboard UI and
the REST API live in the same codebase under `src/app/`.

## How it works

Data is not ingested through the official WhatsApp Business API. Instead, a
**read-only browser extension** (Chrome MV3) runs alongside each agent's WhatsApp
Web tab and acts as a **gateway**: it observes WA Web activity and forwards it to
this backend.

- **Read-only** — the extension only _sends_ events to the backend; the backend
  never pushes commands back.
- **Fire-and-forget / at-least-once** — the extension does not wait for a reply
  and may resend the same batch on retry or crash, so the backend must be
  idempotent (dedup by `payload.id` per account).
- **Auth** — every request carries `Authorization: Bearer <token>`. The
  `account_id` is always derived from the token and is never accepted from the
  request body.

The extension streams four kinds of data:

- **messages** — the `message.received` event for both directions (`fromMe` marks
  outbound). The WA message id is the idempotency key.
- **contacts** — contact metadata attached to `message.received`, upserted by
  `contact.phone` (draft-0019) with "upgrade only" name handling.
- **connection state** — the `connection.status` event (e.g. `hook-lost`) plus a
  heartbeat every minute to `POST /v1/heartbeat`, which drives the
  **online / stale / offline** status.
- **media** — events carry only a _reference_ (`mediaId` + metadata); the raw
  bytes go through a separate door, `POST /v1/media/upload`, so they never clog
  the extension's local queue.

The backend stores everything in PostgreSQL via Drizzle ORM (core tables include
`messages` with `(account_id, message_id) UNIQUE`, `media`, `contacts`, and
`wa_accounts`) and surfaces it in the dashboard (`/p/*`) as business entities:

- **leads** — inbound contacts entered into the pipeline with stages.
- **customers** + **customer-organizations** — leads converted into customers and
  their organizations.
- **conversations** — the per-contact message timeline (polled).
- **tasks** — follow-ups assigned to users.

In short: _WA Web → extension (streams events) → API `/api/v1` → PostgreSQL →
CRM dashboard_.

## Tech stack

- **Framework:** Next.js 16 (App Router, React Compiler) + React 19
- **Database:** PostgreSQL via Drizzle ORM (`drizzle-orm` 1.0 RC) + `drizzle-kit`
- **Auth:** better-auth (email/password) with the Drizzle adapter
- **Data layer:** TanStack Query + TanStack Table
- **Forms/validation:** react-hook-form + Zod
- **UI:** Tailwind CSS v4, Base UI, shadcn, lucide-react, Recharts
- **Media storage:** local disk or S3 (`@aws-sdk/client-s3`)
- **State:** Zustand

## Getting started

Install dependencies and configure the environment:

```bash
pnpm install
cp .env.example .env
```

Fill in `.env` (see `.env.example` for the full list):

| Variable                      | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string                   |
| `BETTER_AUTH_SECRET`          | Session signing secret                         |
| `BETTER_AUTH_URL`             | Public base URL (e.g. `http://localhost:3000`) |
| `SEED_ADMIN_*`                | Credentials for the seeded admin user          |
| `MEDIA_ENABLED`               | Master toggle for media ingestion              |
| `S3_STORAGE_ENABLED` / `S3_*` | S3 storage config (only when enabled)          |

Set up the database, then run the dev server:

```bash
pnpm db:generate   # generate SQL from src/lib/db/schema.ts
pnpm db:migrate    # apply migrations
pnpm db:seed       # create the seed admin user
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to sign in. Authenticated
pages live under `/p/*`.

## Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `pnpm dev`         | Start the Next.js dev server |
| `pnpm build`       | Production build             |
| `pnpm start`       | Run the production build     |
| `pnpm lint`        | ESLint                       |
| `pnpm db:generate` | Generate Drizzle migrations  |
| `pnpm db:migrate`  | Apply Drizzle migrations     |
| `pnpm db:seed`     | Seed the admin user          |

## Project structure

```
src/
  app/
    api/v1/        # REST API routes (thin route handlers)
    p/             # authenticated dashboard pages
  features/        # feature modules (auth, contacts, customers, leads,
                   #   conversations, tasks, media, wa-accounts, ...)
  lib/             # db (Drizzle), auth, errors, api-envelope, guards
  components/      # shared UI
  hooks/
  script/          # seed and one-off scripts
docs/              # gateway handoff & media handling reference
drizzle/           # generated migrations
```

Each feature follows a layered pattern — `schemas/` (Zod) → `repositories/`
(Drizzle) → `services/` (business logic) → `api/` (handlers) → `queries/`
(client hooks) → `components/`, exported through a barrel `index.ts`. Route
files in `src/app/api/v1/` stay thin and just assign handlers.

## API

All REST endpoints are under `/api/v1`. The WA gateway (browser extension)
posts to:

- `POST /api/v1/events` — batched message / connection events (idempotent by message id)
- `POST /api/v1/heartbeat` — per-account liveness (online / stale / offline)
- `POST /api/v1/media/upload` — the only path for media bytes (`multipart/form-data`)

Dashboard resources include `contacts`, `conversations`, `customers`,
`customer-organizations`, `leads`, `tasks`, `users`, `wa-accounts`, and
`dashboard`. See [`docs/handover_to_web.md`](docs/handover_to_web.md) and
[`docs/media_handling.md`](docs/media_handling.md) for the full gateway contract.

## Notes

- See [`AGENTS.md`](AGENTS.md) for agent/contributor conventions, including the
  requirement to consult `node_modules/next/dist/docs/` before writing Next.js code.

## License

[MIT](LICENSE) © 2026 Iqmal

[license]: LICENSE
[next]: https://nextjs.org
[react]: https://react.dev
[typescript]: https://www.typescriptlang.org
[postgres]: https://www.postgresql.org
[drizzle]: https://orm.drizzle.team
[pnpm]: https://pnpm.io
