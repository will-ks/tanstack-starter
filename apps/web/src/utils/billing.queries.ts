import { queryOptions } from "@tanstack/react-query";

import { $getBillingData } from "./billing.functions";

export const billingQueryOptions = () =>
  queryOptions({
    queryKey: ["billing"],
    queryFn: () => $getBillingData(),
  });
