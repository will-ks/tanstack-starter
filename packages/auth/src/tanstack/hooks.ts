import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { authQueryOptions } from "./queries";

export function useAuth() {
  const { data, isPending } = useQuery(authQueryOptions());
  return {
    user: data?.user ?? null,
    organizationId: data?.organizationId ?? null,
    organizationRole: data?.organizationRole ?? null,
    isPending,
  };
}

export function useAuthSuspense() {
  const { data } = useSuspenseQuery(authQueryOptions());
  return {
    user: data.user,
    organizationId: data.organizationId,
    organizationRole: data.organizationRole,
  };
}
