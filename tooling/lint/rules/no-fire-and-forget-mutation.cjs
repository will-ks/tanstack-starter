"use strict";

/**
 * Rule: no-fire-and-forget-mutation
 * ---------------------------------
 * Forbids calling server functions (any identifier matching `/^\\$[A-Za-z]/`)
 * directly inside JSX event-handler attributes (`onClick`, `onSubmit`, etc.).
 *
 * Enforces: apps/web/AGENTS.md — "NEVER call mutating functions
 * (checkout, portal, API POSTs) fire-and-forget in event handlers — always
 * wrap in `useMutation` so the global `MutationCache` can invalidate."
 *
 * Reason: TanStack Query's global `MutationCache` in `src/router.tsx` watches
 * mutations to drive automatic query invalidation. Calling a server fn
 * directly from a click handler bypasses that contract: the write succeeds
 * but dependent queries stay stale, producing subtle UI bugs.
 *
 * Allowed:
 *   - `onClick={() => mutation.mutate(...)}` (mutation defined via useMutation)
 *   - `onClick={() => helper(...)}` where helper is not a server fn
 *
 * Opt out: `// eslint-local/no-fire-and-forget-mutation: off` on the line.
 */

const SERVER_FN_NAME = /^\$[A-Za-z]/;

function isServerFnCallee(callee) {
  if (callee.type === "Identifier" && SERVER_FN_NAME.test(callee.name)) return true;
  if (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier" &&
    SERVER_FN_NAME.test(callee.property.name)
  ) {
    return true;
  }
  return false;
}

function walk(node, visit) {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (
      key === "parent" ||
      key === "loc" ||
      key === "range" ||
      key === "type" ||
      key === "start" ||
      key === "end"
    ) {
      continue;
    }
    const val = node[key];
    if (Array.isArray(val)) {
      for (const child of val) {
        if (child && typeof child.type === "string") walk(child, visit);
      }
    } else if (val && typeof val.type === "string") {
      walk(val, visit);
    }
  }
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Server functions must not be called directly from JSX event handlers — wrap in useMutation",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        const nameNode = node.name;
        if (!nameNode || nameNode.type !== "JSXIdentifier") return;
        if (!/^on[A-Z]/.test(nameNode.name)) return;

        const value = node.value;
        if (!value || value.type !== "JSXExpressionContainer") return;
        const expr = value.expression;
        if (!expr || typeof expr.type !== "string") return;

        walk(expr, (n) => {
          if (n.type !== "CallExpression") return;
          if (!isServerFnCallee(n.callee)) return;
          const calleeName =
            n.callee.type === "Identifier" ? n.callee.name : n.callee.property.name;
          context.report({
            node: n,
            message:
              "Server function `{{name}}` called directly in `{{handler}}`. Wrap it in `useMutation({ mutationFn: ... })` and call `mutation.mutate(...)` here so the global MutationCache can invalidate queries.",
            data: { name: calleeName, handler: nameNode.name },
          });
        });
      },
    };
  },
};
