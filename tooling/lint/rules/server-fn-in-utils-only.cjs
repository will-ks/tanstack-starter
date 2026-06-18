"use strict";

/**
 * Rule: server-fn-in-utils-only
 * -----------------------------
 * Inside `apps/web/`, `createServerFn(...)` may only appear in:
 *   - `src/utils/` recursively, in files named `*.functions.ts` or `*.server.ts`
 *
 * Enforces: apps/web/AGENTS.md — "Server functions live in `src/utils/` as
 * `.functions.ts` files — not co-located with routes."
 *
 * Reason: Centralizing server fns keeps the network boundary visible. Routes
 * should consume server fns via static imports; defining them inline hides the
 * RPC surface, defeats code review, and breaks the "no server-only APIs in
 * loaders" rule.
 *
 * Note: `packages/auth/` has its own convention (`tanstack/functions.ts`) and
 * is out of scope here.
 *
 * Opt out: `// eslint-local/server-fn-in-utils-only: off` on the line.
 */

function getRootCalleeName(node) {
  let current = node;
  while (current) {
    if (current.type === "CallExpression") {
      if (current.callee.type === "Identifier") return current.callee.name;
      if (current.callee.type === "MemberExpression") {
        current = current.callee.object;
        continue;
      }
    }
    return null;
  }
  return null;
}

function isAllowedPath(filename) {
  if (!filename) return true; // don't enforce if we can't tell
  const idx = filename.replace(/\\/g, "/").indexOf("apps/web/src/utils/");
  if (idx === -1) return false;
  const tail = filename.slice(idx);
  return /(\.functions|\.server)\.[a-z]+$/i.test(tail);
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "createServerFn() in apps/web must live in src/utils/**/*.functions.ts or *.server.ts",
    },
    schema: [],
  },
  create(context) {
    const filePath = context.filename;
    if (!filePath || !filePath.replace(/\\/g, "/").includes("apps/web/")) {
      return {};
    }

    function check(node) {
      if (!node.init || node.init.type !== "CallExpression") return;
      const rootName = getRootCalleeName(node.init);
      if (rootName !== "createServerFn") return;
      if (isAllowedPath(filePath)) return;
      context.report({
        node,
        message:
          "`createServerFn()` must live in `apps/web/src/utils/**/*.functions.ts` or `*.server.ts`. Move it out of this file (routes should consume server fns via static imports).",
      });
    }

    return {
      VariableDeclarator: check,
    };
  },
};
