# Tanstack Starter

> [!IMPORTANT]
> This template requires [Vite+ `vp`](https://viteplus.dev/guide/#install-vp) and [pnpm](https://pnpm.io/installation) to be installed.

<!-- scaffold:description -->

A minimal monorepo starter for 🏝️ TanStack Start, based on [mugnavo/tanstarter](https://github.com/mugnavo/tanstarter).

- [Vite Plus](https://viteplus.dev/) + pnpm workspaces with [catalogs](https://pnpm.io/catalogs)
- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest) + [Form](https://tanstack.com/form/latest)
- [Vite 8](https://vite.dev/) + [Nitro v3](https://nitro.build/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) (base-maia, [`--preset b1ZOKpgEC`](https://ui.shadcn.com/create?preset=b1ZOKpgEC&base=base&template=start))
- [ZenStack v3](https://zenstack.dev/) + PostgreSQL
- [Better Auth](https://www.better-auth.com/)

```sh
├── apps
│    ├── web                    # TanStack Start web app
├── packages
│    ├── auth                   # Better Auth
│    ├── db                     # ZenStack ORM + PostgreSQL
│    └── ui                     # shadcn/ui primitives & utils
├── tooling
│    └── tsconfig               # Shared TypeScript configuration
├── vite.config.ts
├── LICENSE
└── README.md
```

## Table of Contents

- [Getting Started](#getting-started)
- [Deploying to production](#deploying-to-production)
- [Issue watchlist](#issue-watchlist)
- [Goodies](#goodies)
  - [Git hooks](#git-hooks)
  - [Scripts](#scripts)
  - [Utilities](#utilities)
- [Ecosystem](#ecosystem)

## Getting Started

> [!IMPORTANT]
> This template requires [Vite+ `vp`](https://viteplus.dev/guide/#install-vp) and [pnpm](https://pnpm.io/installation) to be installed.

1. Clone the repo

2. Create `.env` files in [`/apps/web`](./apps/web/.env.example) and [`/packages/db`](./packages/db/.env.example) based on their respective `.env.example` files.

3. Generate the TypeScript types from your schema, then push to your database:

   ```sh
   pnpm db
   pnpm db:push
   ```

   https://zenstack.dev/docs/

4. Run the development server:

   ```sh
   pnpm dev
   ```

   The development server should now be running at [http://localhost:3000](http://localhost:3000).

> [!TIP]
> If you want to run a local Postgres instance via Docker Compose with the dev server, you can use the [dev.sh](./dev.sh) script:
>
> ```sh
> ./dev.sh # runs "pnpm run --recursive --parallel dev"
> # or
> ./dev.sh web # runs "pnpm run --filter=@repo/web dev"
> ```

## Deploying to production

The [vite config](./apps/web/vite.config.ts#L45-L46) is configured to use Nitro by default, which supports many [deployment presets](https://nitro.build/deploy) like Netlify, Vercel, Node.js, and more.

Refer to the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) for more information.

### Build caching

Vite+ has support for [caching](https://viteplus.dev/guide/cache) via Vite Task. A `build` task is configured in [`apps/web/vite.config.ts`](./apps/web/vite.config.ts) that can enable faster builds via caching. When deploying, use `vp run build` as the build command.

## Issue watchlist

- [Router/Start issues](https://github.com/TanStack/router/issues) - TanStack Start is in RC.
- [Devtools releases](https://github.com/TanStack/devtools/releases) - TanStack Devtools is in alpha and may still have breaking changes.
- [Nitro v3 beta](https://nitro.build/blog/v3-beta) - This template is configured with Nitro v3 beta by default.
- [ZenStack](https://zenstack.dev/) - Access control and ORM layer for PostgreSQL.
- [Better Auth](https://www.better-auth.com/) - Authentication framework.
- [Vite+ issues](https://github.com/voidzero-dev/vite-plus/issues) - Vite+ is in alpha.

## Goodies

#### Git hooks

We use [Vite+ Commit Hooks](https://viteplus.dev/guide/commit-hooks) to run git hooks with the following tools:

- [`vp staged`](https://viteplus.dev/guide/commit-hooks#vp-staged) - Run Oxfmt to format staged files on commit (`pre-commit`).

#### Scripts

This template is configured for **[pnpm](https://pnpm.io/)** by default. Check the root [package.json](./package.json) and each workspace package's `package.json` for the full list of available scripts.

- **`db`** - Generate TypeScript types from the ZenStack schema (`zen generate`).
- **`db:push`** - Push schema changes to the database.
- **`db:migrate`** - Create and apply a migration.
- **`db:reset`** - Reset the database.
- **`ui`** - The shadcn/ui CLI. (e.g. `pnpm ui add button`)
- **`format`**, **`lint`** - Run Oxfmt and Oxlint, or both via `pnpm check`.
- **`deps`** - Selectively upgrade dependencies via taze.

> [!NOTE]
> To switch to another package manager (e.g., bun or npm), you'll need to replace or remove [`pnpm-workspace.yaml`](./pnpm-workspace.yaml), which uses pnpm [catalogs](https://pnpm.io/catalogs). Bun and Yarn have their own equivalents, but the file formats may differ.

#### Utilities

- [`/auth/src/tanstack/middleware.ts`](./packages/auth/src/tanstack/middleware.ts) - Sample middleware for enforcing authentication on server functions & API routes.
- [`/web/src/components/theme-toggle.tsx`](./apps/web/src/components/theme-toggle.tsx), [`/ui/lib/theme-provider.tsx`](./packages/ui/lib/theme-provider.tsx) - A theme toggle and provider for toggling between light and dark mode.

## Ecosystem

- [@tanstack/intent](https://tanstack.com/intent/latest/docs/getting-started/quick-start-consumers) - Up-to-date skills for your AI agents, auto-synchronized from your installed dependencies.
- [awesome-tanstack-start](https://github.com/Balastrong/awesome-tanstack-start) - A curated list of awesome resources for TanStack Start.
- [shadcn/ui Directory](https://ui.shadcn.com/docs/directory), [MCP](https://ui.shadcn.com/docs/mcp), [shoogle.dev](https://shoogle.dev/) - Component directories & registries for shadcn/ui.
