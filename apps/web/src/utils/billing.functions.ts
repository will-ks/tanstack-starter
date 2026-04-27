import { getAvailablePlans, getOrgPlan } from "@repo/auth/plans";
import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { createServerFn } from "@tanstack/react-start";

export const $getBillingData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { organizationId } = context;
    const currentPlan = organizationId ? await getOrgPlan(organizationId) : null;
    const availablePlans = await getAvailablePlans();
    return { currentPlan, availablePlans };
  });
