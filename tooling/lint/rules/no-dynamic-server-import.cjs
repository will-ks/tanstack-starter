"use strict";

/**
 * Rule: no-dynamic-server-import
 * ------------------------------
 * Forbids dynamic `import()` of server functions.
 *
 * Enforces: .agents/tanstack-patterns.md — "Never dynamically import server
 * functions — use static imports."
 *
 * Reason: TanStack Start's environment shaking relies on static references to
 * wire server functions to their client-side RPC stubs. Dynamic imports break
 * this analysis and the call silently fails at runtime.
 *
 * Matches:
 *   - `import("...*.functions")`  — by file naming convention
 *   - `import("~/utils/...")`      — by alias convention (server fns live there)
 *
 * Opt out: `// eslint-local/no-dynamic-server-import: off` on the line.
 */

const SERVER_FN_PATH = /\.functions(\.[a-z]+)?$/i;
const UTILS_ALIAS = /^~\/utils(\.|$|\/)/;

function isServerFnSource(value) {
  if (typeof value !== "string") return false;
  return SERVER_FN_PATH.test(value) || UTILS_ALIAS.test(value);
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow dynamic import() of server functions",
    },
    schema: [],
  },
  create(context) {
    function checkImport(node, sourceValue) {
      if (!isServerFnSource(sourceValue)) return;
      context.report({
        node,
        message:
          'Dynamic import() of server functions is forbidden. Use a static import (e.g. `import { $fn } from "~/utils/..."`).',
      });
    }

    return {
      ImportExpression(node) {
        const src = node.source;
        if (src && src.type === "Literal" && typeof src.value === "string") {
          checkImport(node, src.value);
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === "Import" &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string"
        ) {
          checkImport(node, node.arguments[0].value);
        }
      },
    };
  },
};
