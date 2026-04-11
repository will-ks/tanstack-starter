import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: Outlet,
  beforeLoad: async ({ context }) => {
    const authResult = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!authResult?.user) {
      throw redirect({ to: "/login" });
    }

    return {
      user: authResult.user,
      organizationId: authResult.organizationId,
      organizationRole: authResult.organizationRole,
    };
  },
});
