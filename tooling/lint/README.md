# Lint Rules

Custom ESLint-compatible rules loaded by Oxlint via `vite.config.ts` → `lint.jsPlugins`:

```ts
jsPlugins: [{ name: "eslint-local", specifier: "./tooling/lint/index.cjs" }],
```

Rules are written as ESTree-visitor CJS modules and aggregated by `index.cjs`. Enable them in `vite.config.ts` → `lint.rules` as `"eslint-local/<rule-name>": "error"`. Opt out per-line with `// eslint-local/<rule-name>: off`.

## Rules

### `no-db-internal`

Forbid importing `db` from `@repo/db/internal` outside of `@repo/db` itself. The web app must go through `authDb` from `@repo/db`, which enforces the auth tenant boundary.

Convention source: `AGENTS.md` Anti-Patterns.

### `no-dynamic-server-import`

Forbid `import()` of server-function paths. Static imports only, so the bundler can correctly tree-shake server code.

Matches dynamic imports whose source matches `/\.functions(\.[a-z]+)?$/i` or `~/utils/*`. Convention source: `.agents/tanstack-patterns.md` → "Server Function Organization".

### `server-fn-name-prefix`

Every exported `createServerFn(...)` must be assigned to a `$`-prefixed identifier (e.g. `$getUser`). The prefix is the visual cue that the call is RPC, not a plain function.

Convention source: `AGENTS.md` Conventions.

### `server-fn-in-utils-only`

`createServerFn(...)` may only appear in `apps/web/src/utils/**/*.{functions,server}.ts`. Keeps route files and components free of server-side code.

Convention source: `AGENTS.md` "Where to Look" and `.agents/tanstack-patterns.md` → "Server Function Organization".

### `no-manual-invalidate-queries`

`queryClient.invalidateQueries()` may only be called from `apps/web/src/router.tsx` (which hosts the global `MutationCache`). All cache invalidation flows through the mutation cache — never scatter manual invalidations.

Convention source: `.agents/tanstack-patterns.md` → "Mutations & Cache Invalidation" rule 2.

### `icon-import-suffix`

- `lucide-react` named imports must end in `Icon` (e.g. `Loader2Icon`, `SunIcon`).
- `@icons-pack/react-simple-icons` named imports must start with `Si` (e.g. `SiGithub`).

Convention source: `AGENTS.md` Conventions.

### `no-fire-and-forget-mutation`

Inside JSX event-handler attributes (`onClick`, `onSubmit`, `on[A-Z]*`), forbid calling any `$`-prefixed server function directly or via `await`. Writes must go through `useMutation` so the global `MutationCache` can revalidate queries.

Allowed: `mutation.mutate(...)`, `mutationFn` callbacks, non-server-function calls. Convention source: `.agents/tanstack-patterns.md` → "Mutations & Cache Invalidation" rule 1.

### `protected-server-fn-requires-auth-middleware`

Every `createServerFn(...)` defined in `apps/web/src/utils/**` must chain `.middleware([authMiddleware])` (or `freshAuthMiddleware`). Route-level `beforeLoad` guards do not authorize server-function RPC calls — middleware does.

Accepts either `ArrayExpression` (`[authMiddleware]`) or bare `Identifier` form. Convention source: `.agents/auth.md` → "Server Functions and Mutations".

### `no-pure-crud-server-fn`

Flag a `createServerFn(...)` whose `.handler` body is just a single `return authDb.<model>.<op>(...)` (or `authedDb.<op>(...)` after an optional `const authedDb = authDb.$setAuth(context);` setup line). Those handlers duplicate what ZenStack's auto-CRUD endpoint at `apps/web/src/routes/api/model/$.ts` and the `useDb()` typed hooks already provide — they should be replaced.

Does **not** flag handlers with multiple statements, cross-package calls (`getOrgPlan`, `send`, …), non-ZenStack returns, or manual object literals. Convention source: `.agents/tanstack-patterns.md` → "Auto-CRUD vs Server Functions".

## Conventions NOT enforced here

- **`as` / `satisfies` / manual generic params**: covered by Oxlint's TypeScript plugin.
- **T-prefixed generics** (`TArgs`, `TReturn`): not enforced — would require full TS type analysis. See `.agents/typescript.md`.
- **Never edit generated files** under `packages/db/zenstack/`: defer to a pre-commit hook (not yet wired).
- **Server-only imports (`fs`, `db`) confined to handlers**: partially covered by `no-db-internal`; stricter checks deferred.

## Adding a new rule

1. Create `rules/<name>.cjs` using the ESTree-visitor shape (`meta` + `create(context)` returning visitor handlers).
2. Re-export it from `index.cjs`.
3. Enable it in `vite.config.ts` → `lint.rules` as `"eslint-local/<name>": "error"`.
4. Verify against the existing codebase: `pnpm lint` must report 0 false positives.
5. Write a temporary probe file with a known violation, confirm the rule fires, then delete the probe.
6. Document the rule in this README and annotate the corresponding line in `.agents/*.md` with `*(enforced by \`eslint-local/<name>\`)\*`.

### Gotchas

- **CJS only.** Oxlint's plugin bridge loads these via `require()`. Use `.cjs` extensions and `module.exports`.
- **`require()` paths need explicit extensions.** `require("./rules/foo")` fails — use `require("./rules/foo.cjs")`.
- **JSDoc block comments cannot contain `*/` literally.** Glob patterns like `**/*.functions.ts` inside a `/** ... */` comment will close the comment early. Reword or use `//` line comments.
- **Visitor names are ESTree.** `ImportDeclaration`, `ImportExpression`, `CallExpression`, `MemberExpression`, `JSXAttribute`, `VariableDeclarator`, etc. Oxlint's AST follows the standard shape.
- **`context.filename`** is the absolute path of the file being linted. Normalize with `.replace(/\\/g, "/")` for cross-platform globbing.
