// The triple-slash reference below is intentional: it travels with this module
// so consumers compiling it from source pick up the ambient ImportMetaEnv types.
// eslint-disable-next-line typescript-eslint/triple-slash-reference
/// <reference path="./env.d.ts" />

import { getAsserted } from "@repo/utils";

/**
 * Everything in this module ships to the client bundle — never add a secret
 * here; server-only values belong in `@repo/config/runtime`.
 */
export const buildConfig = {
  get baseUrl() {
    return getAsserted(import.meta.env.VITE_BASE_URL, {
      name: "import.meta.env.VITE_BASE_URL",
    });
  },
};
