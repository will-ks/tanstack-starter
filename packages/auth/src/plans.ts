import "@tanstack/react-start/server-only";
import { DatabaseClient } from "@repo/db";

export async function getOrgPlan(organizationId: string, authedDb: DatabaseClient) {
  const org = await authedDb.organization.findUnique({
    where: { id: organizationId },
    include: { plan: true },
  });

  return org?.plan ?? null;
}

export async function getAvailablePlans(authedDb: DatabaseClient) {
  return authedDb.plan.findMany({ orderBy: { sortOrder: "asc" } });
}
