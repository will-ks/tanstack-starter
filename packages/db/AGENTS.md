# @repo/db

ZenStack v3 ORM + PostgreSQL. Schema-driven type generation with access control policies.

## Files

| File                     | Edit?  | Purpose                                                              |
| ------------------------ | ------ | -------------------------------------------------------------------- |
| `zenstack/schema.zmodel` | ✅ YES | **Source of truth.** Define models, relations, access policies here. |
| `zenstack/schema.ts`     | ❌ NO  | Auto-generated. Run `pnpm db` after schema changes.                  |
| `zenstack/input.ts`      | ❌ NO  | Auto-generated input types for CRUD operations.                      |
| `zenstack/models.ts`     | ❌ NO  | Auto-generated model types.                                          |
| `src/index.ts`           | ✅ YES | Auth-scoped client (`authDb`) + types. Default export for app code.  |
| `src/internal.ts`        | ✅ YES | Raw client (`db`) without policy enforcement.                        |

## Workflow

1. Edit `zenstack/schema.zmodel`
2. Run `pnpm db` (generates `schema.ts`, `input.ts`, `models.ts`)
3. Run `pnpm db:push` (pushes schema changes to PostgreSQL)
4. For migrations: `pnpm db:migrate`

## Schema Conventions

- Models use `@default(nanoid())` or `@default(cuid())` for IDs, `@default(now())` for timestamps
- Access control via `@@allow` policies with `auth().userId` and `auth().organizationId` checks
- BetterAuth models (User, Session, Account, Verification) are predefined — add custom fields under `// Non-BetterAuth fields below` comments
- BetterAuth Organization models (Organization, Member, Invitation) are predefined — follow same pattern
- Non-BetterAuth fields should be added to existing models, not by modifying BetterAuth field definitions

## Exports

Two subpaths with different access levels:

```typescript
// @repo/db — safe, policy-enforced client (default for app code)
import { authDb, schema, type DatabaseClient, type JsonObject } from "@repo/db";
import { InputTypes, ModelTypes } from "@repo/db";

// @repo/db/internal — raw client WITHOUT policy enforcement
import { db } from "@repo/db/internal";
```

- `authDb` (from `@repo/db`): ZenStack client with `PolicyPlugin` — enforces schema-level access control. Use this in server functions and all app code.
- `db` (from `@repo/db/internal`): Raw ZenStack client without policy enforcement.
- `schema`: ZenStack schema object — also imported by the auto-CRUD endpoint and `useDb()` to derive types at runtime.
- `DatabaseClient`: Type for the client instance (works for both `db` and `authDb`)
- `InputTypes` / `ModelTypes`: Namespaced generated types

## Auto-CRUD (every model is exposed via HTTP)

`apps/web/src/routes/api/model/$.ts` mounts ZenStack's `TanStackStartHandler`, exposing **every** model in `schema.zmodel` over `/api/model/<model>/<op>` with full CRUD (`findMany`, `findUnique`, `create`, `update`, `delete`, `upsert`, `count`, `aggregate`, `groupBy`). The handler resolves the authed client per-request via `authDb.$setAuth(...)`.

Frontend code consumes this via `useDb()` from `~/lib/zenstack` — typed TanStack Query hooks per model. See `.agents/tanstack-patterns.md#auto-crud-vs-server-functions` for when to use auto-CRUD vs writing a `$fn`.

### Access-policy cheat sheet (every model is reachable)

ZenStack is **deny-by-default** — no `@@allow` means no access. Audit every new model:

| Pattern                                                              | Effect                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `@@allow('read', true)`                                              | Public read (e.g. `Plan` for pricing)                              |
| `@@allow('read', auth().userId == id)`                               | Owner-only read (e.g. `User`)                                      |
| `@@allow('read', auth().organizationId == id)`                       | Org-scoped read (e.g. `Organization`)                              |
| `@@allow('create', auth().organizationRole == 'owner' \|\| 'admin')` | Role-gated write                                                   |
| No `@@allow`                                                         | Deny all (e.g. `Session`, `Account`, `Verification`)               |
| `@deny('all', true)`                                                 | Hard-deny even from internal code paths (used on `User.createdAt`) |

When adding a new model, decide its `@@allow` policy **before** running `pnpm db` — once `routeTree.gen.ts` regenerates, the model is live at `/api/model/<model>/...`.

## Anti-Patterns

- **NEVER** edit `schema.ts`, `input.ts`, or `models.ts` directly
- **NEVER** import from `../zenstack/schema.ts` in client code — `db` re-exports what's needed
- **NEVER** import `db` from `@repo/db/internal` in `@repo/web` — use `authDb` from `@repo/db` instead
- Database client is server-only (`import "@tanstack/react-start/server-only"` at top of both `src/index.ts` and `src/internal.ts`)
