// Typed React hooks for ZenStack auto-CRUD. Calls the API mounted at
// `/api/model/$.ts`. No codegen step — all types are inferred from the schema
// import.
//
// Usage:
//   import { useDb } from "~/lib/zenstack";
//
//   function OrgList() {
//     const { organization } = useDb();
//     const { data: orgs } = organization.useFindMany();
//     const createOrg = organization.useCreate();
//     // ...
//   }
//
// When to use this vs writing a server function — see `.agents/tanstack-patterns.md`.
// Briefly: any pure CRUD on a model whose @@allow rules are declared in
// `packages/db/zenstack/schema.zmodel` should use these hooks. Reserve
// `apps/web/src/utils/*.functions.ts` for business logic, side effects,
// cross-model transactions, or aggregations.

import { schema } from "@repo/db";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";

export function useDb() {
  return useClientQueries(schema, { endpoint: "/api/model" });
}
