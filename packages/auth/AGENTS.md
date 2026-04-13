# @repo/auth

Better Auth + TanStack Start integration. Server config, client helpers, middleware, and query hooks.

## Files

| File                         | Purpose                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| `src/auth.ts`                | Better Auth server config (providers, session, cookies). **Server-only.** |
| `src/auth-client.ts`         | Client-side auth helper. Use in event handlers/effects only.              |
| `src/tanstack/functions.ts`  | `$getUser` server fn + `_getUser` server-only util                        |
| `src/tanstack/queries.ts`    | `authQueryOptions()` query factory, `AuthQueryResult` type                |
| `src/tanstack/hooks.ts`      | `useAuth()` and `useAuthSuspense()` React hooks                           |
| `src/tanstack/middleware.ts` | `authMiddleware` and `freshAuthMiddleware`                                |

## Exports

Package uses wildcard exports: `@repo/auth/*` maps to `src/*.ts`.
Import as `@repo/auth/auth`, `@repo/auth/tanstack/queries`, etc.

## When to Use What

| Need                               | Use                                                           |
| ---------------------------------- | ------------------------------------------------------------- |
| Get user in route loader/component | `useAuth()` / `useAuthSuspense()` from `tanstack/hooks`       |
| Prefetch auth in `beforeLoad`      | `ensureQueryData(authQueryOptions())` from `tanstack/queries` |
| Protect a server function          | `authMiddleware` from `tanstack/middleware`                   |
| Protect a sensitive mutation       | `freshAuthMiddleware` (bypasses cookie cache)                 |
| Direct server-side auth API        | `auth.api` from `auth.ts` (server-only)                       |
| Client-side login/logout           | `authClient` from `auth-client.ts` (client-only)              |

## Middleware Rules

- `authMiddleware`: Uses cookie cache (5 min). Good for read operations in route loaders.
- `freshAuthMiddleware`: Always hits DB. Use for mutations and destructive operations.
- Both provide context: `{ user, organizationId, organizationRole }`.
- **Both** are required on protected server functions, even if called from `_auth` routes. Route-level `beforeLoad` guards navigation only, not server-function authorization.

## Conventions

- Server functions prefixed with `$` (`$getUser`), server-only utils with `_` (`_getUser`)
- Auth query key is `["auth"]` — shared across hooks and loaders for deduplication
- `authClient` should NOT be used in server/SSR code — use `auth.api` instead
