"use strict";

/**
 * Rule: no-db-internal
 * --------------------
 * Forbids importing from `@repo/db/internal` inside the web app.
 *
 * Enforces: AGENTS.md (root) — "NEVER import raw `db` from `@repo/db/internal`
 * in `@repo/web` — use `authDb` from `@repo/db` instead."
 *
 * Reason: `authDb` enforces ZenStack access policies; the raw `db` client
 * bypasses row-level authorization. Importing it from app code is a security
 * boundary violation.
 *
 * Opt out: `// eslint-local/no-db-internal: off` on the specific line.
 */

const FORBIDDEN = "@repo/db/internal";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: `Disallow importing from '${FORBIDDEN}' in the web app`,
    },
    schema: [],
  },
  create(context) {
    const filePath = context.filename;
    if (!filePath || !filePath.includes("apps/web/")) return {};

    function checkSource(node, source) {
      if (source === FORBIDDEN || source.startsWith(FORBIDDEN + "/")) {
        context.report({
          node,
          message: `Importing from '${FORBIDDEN}' is forbidden in the web app. Use 'authDb' from '@repo/db' instead.`,
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkSource(node, node.source.value);
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string"
        ) {
          checkSource(node, node.arguments[0].value);
        }
      },
    };
  },
};
