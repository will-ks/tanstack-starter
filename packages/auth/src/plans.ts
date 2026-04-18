import "@tanstack/react-start/server-only";
import { db } from "@repo/db";

export async function getOrgPlan(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: { plan: true },
  });

  return org?.plan ?? null;
}

export async function getAvailablePlans() {
  return db.plan.findMany({ orderBy: { sortOrder: "asc" } });
}
