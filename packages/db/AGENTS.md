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
- `schema`: ZenStack schema object
- `DatabaseClient`: Type for the client instance (works for both `db` and `authDb`)
- `InputTypes` / `ModelTypes`: Namespaced generated types

## Anti-Patterns

- **NEVER** edit `schema.ts`, `input.ts`, or `models.ts` directly
- **NEVER** import from `../zenstack/schema.ts` in client code — `db` re-exports what's needed
- **NEVER** import `db` from `@repo/db/internal` in `@repo/web` — use `authDb` from `@repo/db` instead
- Database client is server-only (`import "@tanstack/react-start/server-only"` at top of both `src/index.ts` and `src/internal.ts`)
