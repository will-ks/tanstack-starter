/**
 * Ambient types for Vite build-time environment variables.
 *
 * TanStack Start pattern (see the "Environment Variables" guide): declare the
 * VITE_-prefixed variables read via `import.meta.env` so `@repo/config/build`
 * typechecks without casts. Only variables that are safe to ship to the client
 * bundle belong here — never secrets.
 */
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
