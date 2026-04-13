# @repo/web

TanStack Start app — file-based routing, React 19, Nitro server, React Compiler.

## Structure

```
├── src/
│   ├── routes/              # File-based routing (TanStack Router)
│   │   ├── __root.tsx       # Root layout: devtools, theme, global providers
│   │   ├── index.tsx        # Home page (guest redirect or landing)
│   │   ├── _auth/           # Protected routes (beforeLoad guard)
│   │   │   ├── route.tsx    # Auth layout — ensures user, provides context
│   │   │   └── app/         # App pages (dashboard, jobs, etc.)
│   │   ├── _guest/          # Guest-only routes (login, signup)
│   │   │   ├── route.tsx    # Guest layout — redirects if authenticated
│   │   │   └── login.tsx
│   │   └── api/auth/        # Better Auth API handler
│   ├── components/          # App-specific components
│   ├── server/plugins/      # Nitro server plugins (jobs registration)
│   ├── router.tsx           # Router config
│   └── styles.css           # App styles
├── public/                  # Static assets
└── vite.config.ts           # TanStack Start + Nitro + React Compiler + Tailwind
```

## Route Conventions

- `_auth/` routes: Protected by `beforeLoad` in `_auth/route.tsx`. User available via loader context.
- `_guest/` routes: Redirects authenticated users away. For login/signup only.
- `api/` routes: Server-side API handlers (e.g. Better Auth).
- Route tree is auto-generated: `src/routeTree.gen.ts` (never edit manually).

## Server Functions

- Prefix with `$` (`$getTodos`)
- Wrap in `createServerFn()` from `@tanstack/react-start`
- **Always** apply `authMiddleware` on protected server functions, even inside `_auth` routes
- Static imports only — never dynamic import server functions

## Data Fetching Pattern

```typescript
// Route loader — prefer ensureQueryData for caching
loader: async ({ context }) => {
  const data = await context.queryClient.ensureQueryData(myQueryOptions());
  return { data };
};

// Query factory in separate file
export const myQueryOptions = () =>
  queryOptions({
    queryKey: ["my-data"],
    queryFn: ({ signal }) => $getData({ signal }),
  });
```

## Vite Config

- `apps/web/vite.config.ts`: TanStack Start plugin → Nitro → React Compiler → Tailwind
- Nitro plugin at `src/server/plugins/jobs.ts` registers pg-boss workers on server boot
- React Compiler via `@rolldown/plugin-babel` with `reactCompilerPreset()`
- Devtools enabled in development

## Anti-Patterns

- **NEVER** skip `authMiddleware` on protected server functions
- **NEVER** dynamically import server functions
- **NEVER** edit `routeTree.gen.ts`
- **NEVER** put shared components here — use `packages/ui/`
- **NEVER** access server-only APIs (db, fs) directly in loaders — call server functions instead
