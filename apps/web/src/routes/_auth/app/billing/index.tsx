import { authClient } from "@repo/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";

import { $getBillingData } from "~/utils/billing.functions";

export const Route = createFileRoute("/_auth/app/billing/")({
  component: BillingPage,
  loader: async ({ context }) => {
    const billingData = await context.queryClient.ensureQueryData({
      queryKey: ["billing"],
      queryFn: () => $getBillingData(),
    });
    return { billingData };
  },
});

function BillingPage() {
  const { billingData } = Route.useLoaderData();
  const { currentPlan, availablePlans } = billingData;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <h2 className="text-lg font-semibold">Billing</h2>

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">Current Plan</h3>
        {currentPlan ? (
          <div className="rounded-md border bg-card p-3">
            <div className="font-semibold">{currentPlan.name}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              slug: {currentPlan.slug}
            </div>
          </div>
        ) : (
          <div className="rounded-md border bg-card p-3 text-muted-foreground">
            No active organization
          </div>
        )}
      </section>

      {availablePlans.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">Available Plans</h3>
          <div className="grid gap-2">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between rounded-md border bg-card p-3"
              >
                <div>
                  <div className="font-semibold">{plan.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{plan.slug}</div>
                </div>
                <Button
                  size="sm"
                  variant={currentPlan?.slug === plan.slug ? "outline" : "default"}
                  disabled={currentPlan?.slug === plan.slug || !plan.polarProductId}
                  onClick={() => {
                    if (plan.polarProductId) {
                      authClient.checkout({ products: [plan.polarProductId] });
                    }
                  }}
                >
                  {currentPlan?.slug === plan.slug ? "Current" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">Manage Subscription</h3>
        <Button size="sm" variant="outline" onClick={() => authClient.customer.portal()}>
          Open Billing Portal
        </Button>
      </section>
    </div>
  );
}
