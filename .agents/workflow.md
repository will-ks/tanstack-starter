# Workflow

## Build Commands

- `pnpm build`: Only for build/bundler issues or verifying production output
- `pnpm lint`: Type-checking & type-aware linting
- `pnpm dev` runs indefinitely in watch mode
- `pnpm db` to generate TypeScript types from the ZenStack schema (`zen generate`)
- `pnpm db:push` to push schema changes to the database
- `pnpm db:migrate` to create and apply a migration
- `pnpm db:reset` to reset the database

Don't build after every change. If lint passes; assume changes work.

## Testing

Vitest hasn't been set up yet. Prefer lint checks for now.

## Formatting

Oxfmt (via Vite+) is configured for consistent code formatting via `vp fmt`. It runs automatically on commit via Vite+ pre-commit hooks, so manual formatting is not necessary.
