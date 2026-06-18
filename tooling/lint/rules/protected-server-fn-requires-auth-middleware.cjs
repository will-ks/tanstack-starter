"use strict";

/**
 * Rule: protected-server-fn-requires-auth-middleware
 * --------------------------------------------------
 * Every `createServerFn(...)` chain in `apps/web/src/utils/` must include
 * `.middleware([authMiddleware])` (or `freshAuthMiddleware`).
 *
 * Enforces: apps/web/AGENTS.md — "NEVER skip `authMiddleware` on protected
 * server functions, even inside `_auth` routes." and packages/auth/AGENTS.md
 * middleware rules.
 *
 * Reason: Route-level `beforeLoad` guards navigation only, not server-function
 * authorization. Without `authMiddleware`, a server fn has no authenticated
 * context — `context.user` is undefined and any DB write is anonymous. The
 * middleware is the actual authorization boundary; forgetting it is a security
 * hole lint can catch.
 *
 * Allowed middlewares (from `@repo/auth/tanstack/middleware`):
 *   - `authMiddleware`           (cookie-cached, fine for reads)
 *   - `freshAuthMiddleware`      (always hits DB, use for mutations)
 *
 * Opt out for genuinely public server fns:
 *   `// eslint-local/protected-server-fn-requires-auth-middleware: off`
 */

const AUTH_MIDDLEWARES = new Set(["authMiddleware", "freshAuthMiddleware"]);

function collectChain(node) {
  const calls = [];
  let current = node;
  while (current && current.type === "CallExpression") {
    calls.push(current);
    if (current.callee.type === "MemberExpression") {
      current = current.callee.object;
    } else {
      break;
    }
  }
  return calls;
}

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

function chainHasAuthMiddleware(initNode) {
  const calls = collectChain(initNode);
  for (const call of calls) {
    const callee = call.callee;
    if (
      callee.type !== "MemberExpression" ||
      callee.property.type !== "Identifier" ||
      callee.property.name !== "middleware"
    ) {
      continue;
    }
    for (const arg of call.arguments) {
      if (arg.type === "ArrayExpression") {
        for (const el of arg.elements) {
          if (el && el.type === "Identifier" && AUTH_MIDDLEWARES.has(el.name)) {
            return true;
          }
        }
      } else if (arg.type === "Identifier" && AUTH_MIDDLEWARES.has(arg.name)) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "createServerFn in apps/web/src/utils must chain .middleware([authMiddleware]) or .middleware([freshAuthMiddleware])",
    },
    schema: [],
  },
  create(context) {
    const filePath = (context.filename || "").replace(/\\/g, "/");
    const inUtils = /apps\/web\/src\/utils\//.test(filePath);
    if (!inUtils) return {};

    return {
      VariableDeclarator(node) {
        if (!node.init || node.init.type !== "CallExpression") return;
        if (getRootCalleeName(node.init) !== "createServerFn") return;
        if (chainHasAuthMiddleware(node.init)) return;
        context.report({
          node,
          message:
            "Server function `{{name}}` is missing `authMiddleware` (or `freshAuthMiddleware`). Chain `.middleware([authMiddleware])` after `createServerFn(...)`. Route guards protect navigation only — server-fn authorization lives in the middleware.",
          data: { name: node.id && node.id.name ? node.id.name : "<anonymous>" },
        });
      },
    };
  },
};
