# Tanstack Starter

> [!IMPORTANT]
> This template requires [Vite+ `vp`](https://viteplus.dev/guide/#install-vp) and [pnpm](https://pnpm.io/installation) to be installed.

<!-- scaffold:description -->

A monorepo starter for 🏝️ TanStack Start, based on [mugnavo/tanstarter](https://github.com/mugnavo/tanstarter).

- [Vite Plus](https://viteplus.dev/) + pnpm workspaces with [catalogs](https://pnpm.io/catalogs)
- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest) + [Form](https://tanstack.com/form/latest)
- [Vite 8](https://vite.dev/) + [Nitro v3](https://nitro.build/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) (base-maia, [`--preset b1ZOKpgEC`](https://ui.shadcn.com/create?preset=b1ZOKpgEC&base=base&template=start))
- [Better Auth](https://www.better-auth.com/) — email/password, GitHub & Google OAuth, email OTP, organizations
- [ZenStack v3](https://zenstack.dev/) + PostgreSQL — schema-level access control
- [Polar.sh](https://polar.sh/) — subscriptions, checkout & customer portal
- [pg-boss](https://github.com/timgit/pg-boss) — PostgreSQL-backed background jobs
- [nodemailer](https://nodemailer.com/) + [emailmd](https://www.npmjs.com/package/emailmd) — transactional email
- [pino](https://getpino.io/) — structured logging

```sh
├── apps
│    └── web                    # TanStack Start web app
├── packages
│    ├── auth                   # Better Auth + TanStack integration
│    ├── db                     # ZenStack ORM + PostgreSQL
│    ├── jobs                   # pg-boss background jobs
│    ├── logger                 # Structured logging (pino)
│    ├── mailer                 # Email sending (nodemailer)
│    └── ui                     # shadcn/ui primitives & utils
├── tooling
│    └── tsconfig               # Shared TypeScript configuration
├── vite.config.ts
├── LICENSE
└── README.md
```

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Deploying to production](#deploying-to-production)
- [Issue watchlist](#issue-watchlist)
- [Goodies](#goodies)
  - [Git hooks](#git-hooks)
  - [Scripts](#scripts)
  - [Utilities](#utilities)
- [Ecosystem](#ecosystem)

## Features

### Authentication & Authorization

- Built on [Better Auth](https://www.better-auth.com/): email/password, social OAuth (**GitHub** and **Google**), and **email OTP** login.
- Session caching via cookies (5 min) for fast authenticated reads, with a `freshAuthMiddleware` that bypasses the cache for sensitive mutations.
- Route-level guards in `_auth/` (`beforeLoad`) plus `authMiddleware` on every protected server function.

### Multi-tenant Organizations

- Powered by Better Auth's organization plugin: **owner / admin / member** roles, invitations, and a **personal org auto-created per user** and set as active on each session.
- [ZenStack](https://zenstack.dev/) access policies (`@@allow`) enforce row-level authorization at the schema level.

### Billing & Subscriptions

- [Polar.sh](https://polar.sh/) integration via [`@polar-sh/better-auth`](https://github.com/polarsource/polar-sh/tree/main/packages/better-auth): hosted **checkout**, **customer portal**, and **subscription webhooks**.
- A typed `Plan` model maps 1:1 to Polar products to drive entitlements. A demo billing page (`/app/billing`) is included.

### Background Jobs

- [pg-boss](https://github.com/timgit/pg-boss) queue backed by PostgreSQL, with workers registered at server boot via a [Nitro plugin](./apps/web/src/server/plugins/jobs.ts).
- Queue jobs from server functions with `send()`, and monitor them via the `pnpm jobs:dashboard` dashboard. An example `greeting` worker is included.

### Database & Access Control

- [ZenStack v3](https://zenstack.dev/) ORM over PostgreSQL with two clients: a policy-enforced `authDb` (default for app code) and a raw `db` client.
- The schema ([`schema.zmodel`](./packages/db/zenstack/schema.zmodel)) is the single source of truth — generate types with `pnpm db`, then push with `pnpm db:push`.

### Email

- [`@repo/mailer`](./packages/mailer) wraps nodemailer with [emailmd](https://www.npmjs.com/package/emailmd) markdown templates and ships an OTP login email.
- Defaults to **console mode** (logs the email instead of sending), so you can develop without SMTP credentials.

### Structured Logging

- [`@repo/logger`](./packages/logger) is a thin [pino](https://getpino.io/) wrapper with pretty-printed output in development and JSON in production.

### UI / UX

- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/) (Base UI) primitives in a shared [`@repo/ui`](./packages/ui) package.
- Light/dark [theme toggle](./apps/web/src/components/theme-toggle.tsx) and [provider](./packages/ui/lib/theme-provider.tsx).

### Developer Experience

- Vite+ toolchain: type-aware [Oxlint](https://oxlint.rs/) + [Oxfmt](https://oxc.rs/docs/guide/usage/oxfmt) formatting, gated via `pnpm check`.
- [React Compiler](https://react.dev/learn/react-compiler), TanStack Devtools, and [Vite Task](https://viteplus.dev/guide/cache) build caching (`vp run build`).

### AI-ready

- [`AGENTS.md`](./AGENTS.md) context files document conventions, patterns, and anti-patterns across the workspace.
- [`@tanstack/intent`](https://tanstack.com/intent) auto-syncs up-to-date skills from your installed dependencies (`pnpm intent`).

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

The [vite config](./apps/web/vite.config.ts#L47-L52) is configured to use Nitro by default, which supports many [deployment presets](https://nitro.build/deploy) like Netlify, Vercel, Node.js, and more.

Refer to the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) for more information.

### Build caching

Vite+ has support for [caching](https://viteplus.dev/guide/cache) via Vite Task. A `build` task is configured in [`apps/web/vite.config.ts`](./apps/web/vite.config.ts) that can enable faster builds via caching. When deploying, use `vp run build` as the build command.

## Issue watchlist

- [Router/Start issues](https://github.com/TanStack/router/issues) - TanStack Start is in RC.
- [Devtools releases](https://github.com/TanStack/devtools/releases) - TanStack Devtools is in alpha and may still have breaking changes.
- [Nitro v3 beta](https://nitro.build/blog/v3-beta) - This template is configured with Nitro v3 beta by default.
- [ZenStack](https://zenstack.dev/) - Access control and ORM layer for PostgreSQL.
- [Better Auth](https://www.better-auth.com/) - Authentication framework.
- [Polar.sh](https://polar.sh/) - Subscriptions, billing, and merchant-of-record.
- [Vite+ issues](https://github.com/voidzero-dev/vite-plus/issues) - Vite+ is in alpha.

## Goodies

#### Git hooks

We use [Vite+ Commit Hooks](https://viteplus.dev/guide/commit-hooks) to run git hooks with the following tools:

- [`vp staged`](https://viteplus.dev/guide/commit-hooks#vp-staged) - Run Oxfmt to format staged files on commit (`pre-commit`).

#### Scripts

This template is configured for **[pnpm](https://pnpm.io/)** by default. Check the root [package.json](./package.json) and each workspace package's `package.json` for the full list of available scripts.

- **Development**
  - **`dev`** - Run the dev server across all packages.
  - **`dev:web`** - Run only the web app's dev server.
- **Build**
  - **`build`** - Build all packages.
  - **`build:web`** - Build only the web app.
- **Code quality** (Vite+ — Oxlint + Oxfmt)
  - **`check`** - Format + lint + type-check (the validation gate).
  - **`check:fix`**, **`lint:fix`** - Auto-fix variants (`format` applies fixes by default).
  - **`lint`** - Type-aware lint + type-check.
  - **`format`**, **`format:check`** - Format / check formatting.
- **Database** (ZenStack + PostgreSQL)
  - **`db`** - Generate TypeScript types from the ZenStack schema (`zen generate`).
  - **`db:push`** - Push schema changes to the database.
  - **`db:migrate`** - Create and apply a migration.
  - **`db:reset`** - Reset the database.
  - **`db:studio`** - Open the database studio GUI.
- **UI** (shadcn/ui CLI)
  - **`ui`** - Add components to `@repo/ui` (e.g. `pnpm ui add button`).
  - **`ui:web`** - Add components scoped to the web app.
- **Auth** - **`auth:secret`** - Generate a `BETTER_AUTH_SECRET`.
- **Jobs** - **`jobs:dashboard`** - Launch the pg-boss monitoring dashboard (needs `DATABASE_URL`).
- **Dependencies** - **`deps`**, **`deps:major`** - Selectively upgrade dependencies via taze.
- **Tooling & docs**
  - **`tanstack`** - Look up TanStack docs (`pnpm tanstack doc ... --json`).
  - **`intent`** - Sync [`@tanstack/intent`](https://tanstack.com/intent) AI skills.
  - **`skills`** - Manage agent skills.

> [!NOTE]
> To switch to another package manager (e.g., bun or npm), you'll need to replace or remove [`pnpm-workspace.yaml`](./pnpm-workspace.yaml), which uses pnpm [catalogs](https://pnpm.io/catalogs). Bun and Yarn have their own equivalents, but the file formats may differ.

#### Utilities

- [`/auth/src/tanstack/middleware.ts`](./packages/auth/src/tanstack/middleware.ts) - Sample middleware for enforcing authentication on server functions & API routes.
- [`/web/src/components/theme-toggle.tsx`](./apps/web/src/components/theme-toggle.tsx), [`/ui/lib/theme-provider.tsx`](./packages/ui/lib/theme-provider.tsx) - A theme toggle and provider for toggling between light and dark mode.

### Example routes

The web app ships a few demo routes to show the patterns in action:

| Route               | What it demonstrates                                   |
| ------------------- | ------------------------------------------------------ |
| `/`                 | Landing page.                                          |
| `/login` (`_guest`) | Auth flows (email/password, OAuth, email OTP).         |
| `/app` (`_auth`)    | Protected dashboard, behind `beforeLoad` + middleware. |
| `/app/billing`      | Polar plans, checkout, and customer portal.            |
| `/app/jobs`         | Queueing a pg-boss background job.                     |
| `/api/auth/*`       | Better Auth API handler (catch-all).                   |

## Ecosystem

- [@tanstack/intent](https://tanstack.com/intent/latest/docs/getting-started/quick-start-consumers) - Up-to-date skills for your AI agents, auto-synchronized from your installed dependencies.
- [awesome-tanstack-start](https://github.com/Balastrong/awesome-tanstack-start) - A curated list of awesome resources for TanStack Start.
- [shadcn/ui Directory](https://ui.shadcn.com/docs/directory), [MCP](https://ui.shadcn.com/docs/mcp), [shoogle.dev](https://shoogle.dev/) - Component directories & registries for shadcn/ui.
