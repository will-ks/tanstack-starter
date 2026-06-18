"use strict";

/**
 * Local lint plugin — aggregates all project-specific Oxlint rules.
 *
 * Adding a new rule:
 *   1. Create `./rules/<rule-name>.cjs` exporting `{ meta, create }`.
 *   2. Add it to the map below.
 *   3. Add `"eslint-local/<rule-name>": "error"` to `rules:` in `vite.config.ts`.
 *   4. Add fixtures under `./test/fixtures/<rule-name>/{valid,invalid}.*`.
 *   5. Add a paragraph to `./README.md`.
 *
 * Oxlint loads this file via the `jsPlugins` entry in `vite.config.ts`:
 *   { name: "eslint-local", specifier: "./tooling/lint/index.cjs" }
 *
 * The `eslint-local` name becomes the rule prefix (e.g. `eslint-local/no-db-internal`).
 */

const noDbInternal = require("./rules/no-db-internal.cjs");
const noDynamicServerImport = require("./rules/no-dynamic-server-import.cjs");
const serverFnNamePrefix = require("./rules/server-fn-name-prefix.cjs");
const serverFnInUtilsOnly = require("./rules/server-fn-in-utils-only.cjs");
const noManualInvalidateQueries = require("./rules/no-manual-invalidate-queries.cjs");
const iconImportSuffix = require("./rules/icon-import-suffix.cjs");
const noFireAndForgetMutation = require("./rules/no-fire-and-forget-mutation.cjs");
const protectedServerFnRequiresAuthMiddleware = require("./rules/protected-server-fn-requires-auth-middleware.cjs");

module.exports = {
  rules: {
    "no-db-internal": noDbInternal,
    "no-dynamic-server-import": noDynamicServerImport,
    "server-fn-name-prefix": serverFnNamePrefix,
    "server-fn-in-utils-only": serverFnInUtilsOnly,
    "no-manual-invalidate-queries": noManualInvalidateQueries,
    "icon-import-suffix": iconImportSuffix,
    "no-fire-and-forget-mutation": noFireAndForgetMutation,
    "protected-server-fn-requires-auth-middleware": protectedServerFnRequiresAuthMiddleware,
  },
};
