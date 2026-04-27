# Agent Guidelines

**Commit:** b0cae95 | **Branch:** main | **Node:** >=24 | **PM:** pnpm@10.33.0

## Essentials

- Stack: TypeScript + React (TanStack Start) in a pnpm + Vite+ monorepo, with ZenStack v3, shadcn/ui, Better Auth, and pg-boss.
- Prefer shared `@repo/ui` components; add primitives via shadcn CLI (`pnpm ui add <component>`).
- Use `lucide-react` for UI icons (use `Icon` suffix, e.g. `import { Loader2Icon } from "lucide-react"`); for brand icons use `@icons-pack/react-simple-icons` (e.g. `SiGithub`).
- Use shared pnpm catalog versions (`pnpm-workspace.yaml`) via `catalog:`.
- For TanStack libraries, consult latest docs via `pnpm tanstack <command>` (see [Workflow](.agents/workflow.md#tanstack-cli)).
- Don't build after every little change. If `pnpm lint` passes; assume changes work.

## Structure

```
.
├── apps/web/                  # TanStack Start app (routes, components, router)
│   └── src/routes/            # File-based routing
│       ├── __root.tsx         # Root layout, devtools, theme
│       ├── _auth/             # Protected routes (beforeLoad guard)
│       ├── _guest/            # Guest-only routes (login, signup)
│       └── api/auth/          # Better Auth API handler
├── packages/
│   ├── auth/                  # @repo/auth - Better Auth + TanStack integration
│   ├── db/                    # @repo/db - ZenStack ORM + PostgreSQL
│   ├── jobs/                  # @repo/jobs - pg-boss background task queue
│   ├── mailer/                # @repo/mailer - Email sending (nodemailer)
│   └── ui/                    # @repo/ui - shadcn/ui components & utilities
├── tooling/tsconfig/          # @repo/tsconfig - shared TS base config
└── .agents/                   # Detailed topic guides
```

## Where to Look

| Task                       | Location                                        | Notes                                                                |
| -------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| Add a page/route           | `apps/web/src/routes/`                          | File-based routing; `_auth/` for protected, `_guest/` for guest-only |
| Add shared UI component    | `packages/ui/components/`                       | `pnpm ui add <name>`; exported as `@repo/ui/components/<name>`       |
| Add app-specific component | `apps/web/src/components/`                      | Local to web app                                                     |
| Edit auth config           | `packages/auth/src/auth.ts`                     | Better Auth server config (social providers, session)                |
| Edit auth middleware       | `packages/auth/src/tanstack/middleware.ts`      | `authMiddleware`, `freshAuthMiddleware`                              |
| Edit DB schema             | `packages/db/zenstack/schema.zmodel`            | Then run `pnpm db` to regenerate                                     |
| Add background job         | `packages/jobs/src/workers/`                    | Create queue, add handler, register in `workers/index.ts`            |
| Queue a job                | `send()` from `@repo/jobs`                      | Call from server functions                                           |
| Monitor jobs               | `pnpm jobs:dashboard`                           | Requires `DATABASE_URL` in environment                               |
| Add server function        | `apps/web/src/utils/`                           | Prefix with `$`, wrap in `createServerFn`, use `~/` alias in routes  |
| Add TanStack query         | Near the consuming code or in auth `queries.ts` | Use `queryOptions()` pattern                                         |
| Lint/format config         | `vite.config.ts` (root)                         | Oxfmt + Oxlint via Vite+                                             |
| Vite/build config          | `apps/web/vite.config.ts`                       | TanStack Start, Nitro, React Compiler                                |

## Commands

```bash
pnpm dev          # Dev server (all packages)
pnpm dev:web      # Dev server (web only)
pnpm lint         # Type-check + type-aware lint (Oxlint)
pnpm check        # Format + lint + type-check
pnpm build        # Production build (all)
pnpm db           # Generate ZenStack types (run after schema changes)
pnpm db:push      # Push schema to database
pnpm jobs:dashboard  # pg-boss monitoring dashboard (needs DATABASE_URL)
pnpm ui           # shadcn/ui CLI (adds to packages/ui)
pnpm ui:web       # shadcn/ui CLI (adds to apps/web)
```

## Conventions

- **Oxfmt** (not Prettier): double quotes, 100 char width, trailing commas, LF endings
- **Oxlint** (not ESLint): type-aware linting with TanStack Router/Query plugins + React Compiler rules
- **Path aliases**: `~/` → `apps/web/src/`, `@repo/*` → workspace packages
- **Icon imports**: `lucide-react` with `Icon` suffix (`Loader2Icon`), brand icons from `@icons-pack/react-simple-icons`
- **Server functions**: prefix with `$` (`$getUser`), static imports only (never dynamic)
- **Query pattern**: `queryOptions()` factories, `ensureQueryData` in loaders
- **Tests**: Not set up yet. Lint is the validation gate.

## Anti-Patterns

- **NEVER** use `as`, `satisfies`, or manual generic params — infer types instead (see `.agents/typescript.md`)
- **NEVER** dynamically import server functions — use static imports
- **NEVER** use pnpm/npm/yarn directly — use `vp` commands (see `.agents/vite-plus.md`)
- **NEVER** edit generated files in `packages/db/zenstack/` (except `schema.zmodel`)
- **NEVER** import raw `db` from `@repo/db/internal` in `@repo/web` — use `authDb` from `@repo/db` instead
- **NEVER** skip `authMiddleware` on protected server functions, even inside `_auth` routes
- Generic type params must be `T`-prefixed: `TArgs`, `TReturn`, `TData`

## Topic-specific Guidelines

- [TanStack patterns](.agents/tanstack-patterns.md) - Routing, data fetching, loaders, server functions, environment shaking
- [Auth patterns](.agents/auth.md) - Route guards, middleware, auth utilities
- [TypeScript conventions](.agents/typescript.md) - Casting rules, prefer type inference
- [Workflow](.agents/workflow.md) - Workflow commands, validation approach
- [Vite+](.agents/vite-plus.md) - Vite+ commands, common pitfalls

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "general TanStack Router and @tanstack/react-router docs for routes, layouts, route tree, and navigation"
  load: "apps/web/node_modules/@tanstack/react-router/dist/llms/index.js"
- task: "general TanStack Start and @tanstack/react-start docs for app structure, patterns, and server features"
  load: "apps/web/node_modules/@tanstack/react-start/skills/react-start/SKILL.md"

<!-- intent-skills:end -->

## TanStack Docs

Use `pnpm tanstack` (which is aliased to `vpx @tanstack/cli@latest` in `package.json`) to look up TanStack documentation. Always pass `--json` for machine-readable output.

```bash
pnpm tanstack doc router framework/react/guide/data-loading --json
pnpm tanstack search-docs "server functions" --library start --json
```
