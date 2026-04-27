import { getAvailablePlans, getOrgPlan } from "@repo/auth/plans";
import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { authDb } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";

export const $getBillingData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { organizationId } = context;
    const authedDb = authDb.$setAuth(context);
    const currentPlan = organizationId ? await getOrgPlan(organizationId, authedDb) : null;
    const availablePlans = await getAvailablePlans(authedDb);
    return { currentPlan, availablePlans };
  });

export const $getPlansData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { organizationId } = context;
    const authedDb = authDb.$setAuth(context);
    const currentPlan = organizationId ? await getOrgPlan(organizationId, authedDb) : null;
    const availablePlans = await getAvailablePlans(authedDb);
    return { currentPlan, availablePlans };
  });
