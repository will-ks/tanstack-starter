# @repo/db

ZenStack v3 ORM + PostgreSQL. Schema-driven type generation with access control policies.

## Files

| File                     | Edit?  | Purpose                                                              |
| ------------------------ | ------ | -------------------------------------------------------------------- |
| `zenstack/schema.zmodel` | ✅ YES | **Source of truth.** Define models, relations, access policies here. |
| `zenstack/schema.ts`     | ❌ NO  | Auto-generated. Run `pnpm db` after schema changes.                  |
| `zenstack/input.ts`      | ❌ NO  | Auto-generated input types for CRUD operations.                      |
| `zenstack/models.ts`     | ❌ NO  | Auto-generated model types.                                          |
| `src/index.ts`           | ✅ YES | Database client singleton (`db`). Exports types and client.          |

## Workflow

1. Edit `zenstack/schema.zmodel`
2. Run `pnpm db` (generates `schema.ts`, `input.ts`, `models.ts`)
3. Run `pnpm db:push` (pushes schema changes to PostgreSQL)
4. For migrations: `pnpm db:migrate`

## Schema Conventions

- Models use `@default(nanoid())` for IDs, `@default(now())` for timestamps
- Access control via `@@allow` policies with `auth().id` checks
- BetterAuth models (User, Session, Account, Verification) are predefined — add custom fields under `// Non-BetterAuth fields below` comments
- Non-BetterAuth fields should be added to existing models, not by modifying BetterAuth field definitions

## Exports

```typescript
import { db, schema, type DatabaseClient, type JsonObject } from "@repo/db";
import { InputTypes, ModelTypes } from "@repo/db";
```

- `db`: ZenStack client singleton (uses `globalThis` caching in dev)
- `schema`: ZenStack schema object
- `DatabaseClient`: Type for the client instance
- `InputTypes` / `ModelTypes`: Namespaced generated types

## Anti-Patterns

- **NEVER** edit `schema.ts`, `input.ts`, or `models.ts` directly
- **NEVER** import from `../zenstack/schema.ts` in client code — `db` re-exports what's needed
- Database client is server-only (`import "@tanstack/react-start/server-only"` at top of `src/index.ts`)
