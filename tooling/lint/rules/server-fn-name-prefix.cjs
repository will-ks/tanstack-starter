"use strict";

/**
 * Rule: server-fn-name-prefix
 * ---------------------------
 * Every `createServerFn(...)` binding must be named with a `$` prefix.
 *
 * Enforces: apps/web/AGENTS.md — "Prefix with `$` (`$getTodos`)".
 *
 * Reason: The `$` prefix is the visual signal that a function is a server fn
 * (crosses the network via RPC). Agents and reviewers rely on it to spot
 * accidental client-side use and to distinguish server fns from regular
 * helpers, query factories, etc.
 *
 * Matches any `const NAME = createServerFn(...)...` (including chained
 * `.middleware().handler()`) where `NAME` does not start with `$`.
 *
 * Opt out: `// eslint-local/server-fn-name-prefix: off` on the line.
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

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Server functions (createServerFn) must be named with a `$` prefix",
    },
    schema: [],
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (!node.id || node.id.type !== "Identifier") return;
        if (!node.init || node.init.type !== "CallExpression") return;
        const rootName = getRootCalleeName(node.init);
        if (rootName !== "createServerFn") return;
        if (node.id.name.startsWith("$")) return;
        context.report({
          node: node.id,
          message:
            "Server function `{{name}}` must be prefixed with `$` (e.g. `${{name}}`). The `$` signals that it crosses the network via RPC.",
          data: { name: node.id.name },
        });
      },
    };
  },
};
