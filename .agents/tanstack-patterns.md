<!-- based on https://github.com/TanStack/tanstack.com/blob/main/.claude/tanstack-patterns.md -->

# TanStack Patterns

## Route Group Conventions

- Protected routes live under `apps/web/src/routes/_auth/**`, enforced by `beforeLoad` in the `_auth` layout (`apps/web/src/routes/_auth/route.tsx`).
- Guest-only routes live under `apps/web/src/routes/_guest/**`, enforced by `beforeLoad` in the `_guest` layout (`apps/web/src/routes/_guest/route.tsx`).
- Auth-specific route guard behavior and middleware rules are documented in `.agents/auth.md`.

## Data Fetching

Route loaders are isomorphic; they run on both server and client. They cannot directly access server-only APIs.

```typescript
// Bad: direct server API access
loader: async () => {
  const todos = await fs.readFile("todos.json");
  return { todos };
};
```

```typescript
// Good (minimal/valid): call a server function from the loader
loader: async () => {
  const todos = await $getTodos({ data: {} });
  return { todos };
};
```

Instead of directly calling server functions in loaders, prefer wrapping in TanStack Query for better caching and reusability.

```typescript
loader: async ({ context }) => {
  // Best/Preferred: For read/data-fetching server functions, wrap in TanStack Query
  const todos = await context.queryClient.ensureQueryData(todosQueryOptions());
  return { todos };
};

// lib/todos/queries.ts
export const todosQueryOptions = () =>
  queryOptions({
    queryKey: ["todos"],
    queryFn: ({ signal }) => $getTodos({ signal }), // TanStack Query calls the server function
  });
```

## Mutations & Cache Invalidation

A global `MutationCache` in `apps/web/src/router.tsx` automatically invalidates all queries after every successful mutation (the "Remix semantic"). This eliminates the "forgot to invalidate" bug class entirely.

### Rules

1. **Always wrap writes in `useMutation`** — never call mutating functions fire-and-forget in `onClick`/`onSubmit`. If a write isn't a `useMutation`, the cache won't know to revalidate.

```typescript
// Bad: fire-and-forget, cache never invalidates
<Button onClick={() => authClient.checkout({ products: [id] })}>

// Good: useMutation triggers automatic invalidation
const checkoutMutation = useMutation({
  mutationFn: (productId: string) =>
    authClient.checkout({ products: [productId] }),
});
<Button onClick={() => checkoutMutation.mutate(id)} />
```

2. **Never call `invalidateQueries` manually** — the global `MutationCache` handles it. Manual invalidation is only needed for imperative cache updates outside mutations (e.g., `setQueryData` on sign-out).

3. **Always use query options factories** — never inline `queryKey` arrays in loaders or components. Create a factory in `src/utils/<feature>.queries.ts`:

```typescript
// src/utils/billing.queries.ts
export const billingQueryOptions = () =>
  queryOptions({
    queryKey: ["billing"],
    queryFn: () => $getBillingData(),
  });

// In the route loader
loader: async ({ context }) => {
  const data = await context.queryClient.ensureQueryData(billingQueryOptions());
  return { data };
};
```

### Opting out of automatic invalidation

- **Scope a mutation**: set `meta: { invalidates: [["key"]] }` to invalidate only the listed query keys instead of all:

```typescript
useMutation({
  mutationFn: updateLabel,
  meta: { invalidates: [["labels"]] },
});
```

- **Exempt a query**: set `staleTime: "static"` on its `queryOptions` to prevent it from ever auto-refetching (useful for static config, lookup tables).

## Environment Shaking

TanStack Start strips any code not referenced by a `createServerFn` handler from the client build.

- Server-only code (database, fs) is automatically excluded from client bundles
- Only code inside `createServerFn` handlers goes to server bundles
- Code outside handlers is included in both bundles

## Server Function Organization

Server functions live in `src/utils/` as `.functions.ts` files. They are imported statically from routes using the `~/` alias. Never define server functions inline in route files.

```typescript
// src/utils/todos.functions.ts
export const $getTodos = createServerFn({ method: "GET" }).handler(async () => {
  /* ... */
});

// src/routes/_auth/app/todos/index.tsx
import { $getTodos } from "~/utils/todos.functions";
```

Never use dynamic imports for server functions:

```typescript
// Bad: dynamic import causes bundler issues
const rolesQuery = useQuery({
  queryFn: async () => {
    const { $listRoles } = await import("~/utils/roles.functions");
    return $listRoles({ data: {} });
  },
});

// Good: static import
import { $listRoles } from "~/utils/roles.functions";

const rolesQuery = useQuery({
  queryFn: async () => $listRoles({ data: {} }),
});
```

## Server-Only Import Rules

1. `createServerFn` wrappers can be imported statically anywhere
2. Direct server-only code (database clients, fs) must only be imported:
   - Inside `createServerFn` handlers
   - In `*.server.ts` files

## Auth-specific Patterns

- See `.agents/auth.md` for auth middleware usage, route guards, and session/cookie patterns.
