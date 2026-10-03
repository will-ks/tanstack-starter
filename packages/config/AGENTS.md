# @repo/config

The only place in the repo where environment variables are read. Fail-fast validation, split by runtime context.

## Files

| File             | Purpose                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| `src/runtime.ts` | `runtimeConfig` — server runtime config. Reads `process.env`. **Server-only.**      |
| `src/build.ts`   | `buildConfig` — client-safe config. Reads `import.meta.env.VITE_*` (build-inlined). |
| `src/env.d.ts`   | Ambient `ImportMetaEnv` types so `build.ts` typechecks without casts.               |

## Exports (subpaths — there is deliberately no barrel index)

```typescript
// Server code (importing from client code is a build error)
import { runtimeConfig, assertRuntimeConfig } from "@repo/config/runtime";

// Client-safe code
import { buildConfig } from "@repo/config/build";
```

No barrel index on purpose: `runtime.ts` carries the `server-only` marker, and a
barrel would drag it into every client import of `buildConfig`.

## Design

- **Lazy getters, not eager reads.** Validation runs on property access, not module
  load, so partial contexts (unit tests, tooling) that only exercise some variables
  don't crash on unrelated assertions. `assertRuntimeConfig()` evaluates every getter
  via `Object.values(runtimeConfig)` — requiredness lives in the getters themselves, so
  it needs no maintained list — and is called once at server boot from
  `apps/web/src/server/plugins/jobs.ts`. That is the fail-fast guarantee for the
  application.
- **Required vs optional.** Required values throw via `getAsserted` (`@repo/utils`)
  with a `process.env.<NAME> is null or undefined` message. Optional values are typed
  and defaulted (`polarServer`, `logLevel` — which also rejects invalid values — and
  `isProduction`).
- **`import.meta.env` on the server?** No. Server code reads `process.env` (dynamic at
  runtime, correct for prod Node). Client code reads `import.meta.env` (Vite inlines it
  at build time — a missing `VITE_BASE_URL` fails the build, not the browser).

## Conventions

- Adding a new env var: add the getter here, then update `env-example` at the repo root.
- Never read `process.env` / `import.meta.env` anywhere else in the repo
  _(enforced by Oxlint's built-in `node/no-process-env`; this module's exemption
  lives in the `lint.overrides` block in the root `vite.config.ts`)_.
- Never put a secret behind the `VITE_` prefix; everything in `buildConfig` ships to
  the client bundle.

## Anti-Patterns

- **NEVER** add a barrel `index.ts` re-exporting both modules (breaks the server-only boundary)
- **NEVER** import `@repo/config/runtime` from code reachable by the client bundle
- **NEVER** read env vars in consuming packages "just this once" — add a getter instead
