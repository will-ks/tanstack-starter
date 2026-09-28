"use strict";

/**
 * Rule: no-pure-crud-server-fn
 * ----------------------------
 * Flag a `createServerFn(...)` whose `.handler` body is just a single
 * `return authDb.<model>.<op>(...)` (or `authedDb.<op>(...)` after
 * `const authedDb = authDb.$setAuth(...)`) with no other logic.
 *
 * Enforces: `.agents/tanstack-patterns.md` -> "Auto-CRUD vs Server Functions".
 * Pure CRUD belongs in `useDb()` hooks (or `authDb.<model>.<op>()` in loaders)
 * via the auto-CRUD endpoint at `apps/web/src/routes/api/model/$.ts`.
 *
 * What this rule catches:
 *   - `export const $getUsers = createServerFn(...) .handler(async () => {
 *       return authDb.user.findMany();
 *     });`
 *   - `export const $getUser = createServerFn(...) .handler(async ({ data }) => {
 *       const db = authDb.$setAuth(context);
 *       return db.user.findUnique({ where: { id: data.id } });
 *     });`
 *
 * What this rule does NOT flag (legit $fn uses):
 *   - Handlers with multiple statements (extra business logic)
 *   - Handlers that call cross-package helpers (getOrgPlan, send, ...)
 *   - Handlers whose single return is NOT a ZenStack client call
 *   - Handlers that return a manual object literal, primitive, etc.
 *
 * The detector is intentionally narrow: it only fires when the entire handler
 * body is a single ReturnStatement whose argument is a CallExpression on
 * `<authDb|authedDb|db>.<member>.<op>(...)` or `<authDb|...>.<op>(...)`.
 *
 * Opt out for handlers that look pure-CRUD but legitimately need to be RPC:
 *   `// eslint-local/no-pure-crud-server-fn: off`
 */

const PURE_CLIENT_NAMES = new Set(["authDb", "authedDb", "db"]);

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

function isPureClientCall(node) {
  // Direct: authDb.findMany(...) — unusual but accept
  if (node.type === "CallExpression" && node.callee.type === "Identifier") {
    return PURE_CLIENT_NAMES.has(node.callee.name);
  }
  // Member: authDb.user.findMany(...) or authDb.findMany(...)
  if (node.type === "CallExpression" && node.callee.type === "MemberExpression") {
    // Walk the callee.object chain to the innermost Identifier.
    let inner = node.callee.object;
    while (inner && inner.type === "MemberExpression") {
      inner = inner.object;
    }
    return !!(inner && inner.type === "Identifier" && PURE_CLIENT_NAMES.has(inner.name));
  }
  return false;
}

function isAuthContextSetup(stmt) {
  // `const X = authDb.$setAuth(...)` (or any call on authDb) counts as trivial
  // setup — auto-CRUD does this internally via getClient(), so it's not
  // "business logic" that justifies a hand-written server fn.
  if (stmt.type !== "VariableDeclaration") return false;
  for (const decl of stmt.declarations) {
    if (!decl.init) return false;
    if (decl.init.type !== "CallExpression") return false;
    const callee = decl.init.callee;
    let inner = callee;
    while (inner && inner.type === "MemberExpression") inner = inner.object;
    if (!inner || inner.type !== "Identifier" || !PURE_CLIENT_NAMES.has(inner.name)) {
      return false;
    }
  }
  return true;
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Server functions should not just wrap a single ZenStack CRUD call — use useDb() hooks or authDb.<model>.<op>() in loaders instead",
    },
    schema: [],
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (!node.init || node.init.type !== "CallExpression") return;
        if (getRootCalleeName(node.init) !== "createServerFn") return;

        // Find the `.handler(...)` call in the chain.
        const calls = collectChain(node.init);
        const handlerCall = calls.find((c) => {
          const callee = c.callee;
          return (
            callee.type === "MemberExpression" &&
            callee.property.type === "Identifier" &&
            callee.property.name === "handler"
          );
        });
        if (!handlerCall) return;

        // Handler arg is typically `async (...) => { ... }` (ArrowFunction)
        // or `function (...) { ... }` (FunctionExpression).
        const handlerFn = handlerCall.arguments[0];
        if (!handlerFn) return;
        if (
          handlerFn.type !== "ArrowFunctionExpression" &&
          handlerFn.type !== "FunctionExpression"
        ) {
          return;
        }
        const body = handlerFn.body;
        if (!body || body.type !== "BlockStatement") return;

        // Allow at most one trivial setup statement (e.g. `const authedDb = authDb.$setAuth(...)`)
        // before the single ReturnStatement.
        if (!body.body || body.body.length === 0 || body.body.length > 2) return;
        const lastStmt = body.body[body.body.length - 1];
        if (lastStmt.type !== "ReturnStatement") return;
        if (!lastStmt.argument || lastStmt.argument.type !== "CallExpression") return;
        for (let i = 0; i < body.body.length - 1; i++) {
          if (!isAuthContextSetup(body.body[i])) return;
        }

        if (isPureClientCall(lastStmt.argument)) {
          context.report({
            node,
            message:
              "Server function `{{name}}` is pure CRUD — replace with `useDb()` hooks (frontend) or `authDb.<model>.<op>()` in a loader. See .agents/tanstack-patterns.md#auto-crud-vs-server-functions.",
            data: { name: node.id && node.id.name ? node.id.name : "<anonymous>" },
          });
        }
      },
    };
  },
};
