import { authClient } from "@repo/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { billingQueryOptions } from "~/utils/billing.queries";

export const Route = createFileRoute("/_auth/app/billing/")({
  component: BillingPage,
  loader: async ({ context }) => {
    const billingData = await context.queryClient.ensureQueryData(billingQueryOptions());
    return { billingData };
  },
});

function BillingPage() {
  const { billingData } = Route.useLoaderData();
  const { currentPlan, availablePlans } = billingData;

  const checkoutMutation = useMutation({
    mutationFn: (productId: string) => authClient.checkout({ products: [productId] }),
  });

  const portalMutation = useMutation({
    mutationFn: () => authClient.customer.portal(),
  });

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
                  disabled={
                    currentPlan?.slug === plan.slug ||
                    !plan.polarProductId ||
                    checkoutMutation.isPending
                  }
                  onClick={() => {
                    if (plan.polarProductId) {
                      checkoutMutation.mutate(plan.polarProductId);
                    }
                  }}
                >
                  {checkoutMutation.isPending
                    ? "Redirecting..."
                    : currentPlan?.slug === plan.slug
                      ? "Current"
                      : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">Manage Subscription</h3>
        <Button
          size="sm"
          variant="outline"
          disabled={portalMutation.isPending}
          onClick={() => portalMutation.mutate()}
        >
          {portalMutation.isPending ? "Opening..." : "Open Billing Portal"}
        </Button>
      </section>
    </div>
  );
}
