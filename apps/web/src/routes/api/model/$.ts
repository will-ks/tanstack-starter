// ZenStack auto-CRUD API. Mounts a single catch-all route that exposes
// findMany/findUnique/create/update/delete/upsert/count/aggregate for EVERY model
// in packages/db/zenstack/schema.zmodel, with @@allow policies automatically
// enforced (the auth context is wired up in `getClient` below).
//
// Use this instead of writing a `$createX` / `$listX` server function for any
// model whose access rules are already declared with @@allow in the schema.
// See `.agents/tanstack-patterns.md` -> "When to write a server function" for
// the decision tree, and `apps/web/src/lib/zenstack.ts` for the typed React
// hooks that call this endpoint.

import { _getUser } from "@repo/auth/tanstack/functions";
import { authDb, schema } from "@repo/db";
import { createFileRoute } from "@tanstack/react-router";
import { RPCApiHandler } from "@zenstackhq/server/api";
import { TanStackStartHandler } from "@zenstackhq/server/tanstack-start";

// RPC-style handler — mirrors the ZenStackClient API (e.g. POST /api/model/todo
// with `{ "args": { "data": { ... } } }`). Use RestApiHandler from
// `@zenstackhq/server/api` if you want a JSON:API compliant alternative.
const apiHandler = new RPCApiHandler({ schema });

// Build a per-request policy-enforced client. Reuses the same `_getUser()` that
// `authMiddleware` uses elsewhere, so @@allow policies see the exact same
// `{ userId, organizationId, organizationRole }` context that server functions do.
async function getClient() {
  const { user, organizationId, organizationRole } = await _getUser();
  return authDb.$setAuth(user ? { userId: user.id, organizationId, organizationRole } : undefined);
}

const handler = TanStackStartHandler({ apiHandler, getClient });

export const Route = createFileRoute("/api/model/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
      PUT: handler,
      PATCH: handler,
      DELETE: handler,
    },
  },
});
