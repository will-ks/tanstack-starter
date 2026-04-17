import "@tanstack/react-start/server-only";
import { db } from "@repo/db";

// Implicit free tier — returned when org has no plan assigned.
// Add entitlement fields here to match Plan model columns.
const FREE_TIER = {
  slug: "free",
  name: "Free",
} as const;

export async function getOrgPlan(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: { plan: true },
  });

  return org?.plan ?? { ...FREE_TIER };
}

export async function getAvailablePlans() {
  return db.plan.findMany({ orderBy: { sortOrder: "asc" } });
}
