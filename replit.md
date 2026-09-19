# HealthVault

HealthVault keeps personal and family medical history organized as a clear, chronological memory.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/healthvault/src/` — routed React app and product UI
- `artifacts/api-server/src/routes/healthvault.ts` — HealthVault API handlers
- `lib/api-spec/openapi.yaml` — API contract and source of truth for generated client hooks
- `lib/db/src/schema/healthvault.ts` — PostgreSQL schema for profiles, events, and reminders
- `artifacts/healthvault/src/index.css` — HealthVault visual tokens and global styling

## Architecture decisions

- Health history is modeled as contextual timeline events rather than as a document-only locker.
- Calendar dates are stored as PostgreSQL `date` values so a medical day cannot shift across time zones.
- The shared API server owns the health domain routes; the web artifact consumes generated OpenAPI hooks.
- The first build uses seeded development data to make the family timeline understandable on first load.

## Product

- Family dashboard with recent activity and follow-up counts
- Multiple family profiles with profile-level timelines
- Create, edit, search, filter, and delete health memories
- Follow-up reminders with completion flow
- Doctor-ready health summary with copy and print actions

## User preferences

No additional preferences recorded.

## Gotchas

- Run OpenAPI codegen after changing `lib/api-spec/openapi.yaml`.
- The frontend artifact build needs `PORT` and `BASE_PATH`, which the managed workflow supplies automatically.
- Authentication, private sharing, and medical document uploads are intentionally next-stage work.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
