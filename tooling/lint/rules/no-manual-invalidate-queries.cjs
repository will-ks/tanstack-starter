"use strict";

/**
 * Rule: no-manual-invalidate-queries
 * ----------------------------------
 * Forbids `.invalidateQueries(...)` calls outside `apps/web/src/router.tsx`.
 *
 * Enforces: apps/web/AGENTS.md — "A global `MutationCache` in `src/router.tsx`
 * automatically invalidates all queries after every successful mutation —
 * never call `invalidateQueries` manually."
 *
 * Reason: Manual invalidation bypasses the centralized cache contract. To
 * control invalidation scope, use the documented opt-out mechanisms
 * (`meta.invalidates`, `staleTime: "static"`) — see
 * `.agents/tanstack-patterns.md#mutations--cache-invalidation`.
 *
 * Opt out: `// eslint-local/no-manual-invalidate-queries: off` on the line.
 */

const ALLOWED_FILE = /apps\/web\/src\/router\.tsx$/;

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow queryClient.invalidateQueries outside src/router.tsx",
    },
    schema: [],
  },
  create(context) {
    const filePath = (context.filename || "").replace(/\\/g, "/");
    if (ALLOWED_FILE.test(filePath)) return {};

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "invalidateQueries"
        ) {
          context.report({
            node,
            message:
              'Manual `invalidateQueries` is forbidden outside `src/router.tsx`. The global MutationCache handles invalidation automatically; use `meta.invalidates` or `staleTime: "static"` to control scope (see .agents/tanstack-patterns.md).',
          });
        }
      },
    };
  },
};
