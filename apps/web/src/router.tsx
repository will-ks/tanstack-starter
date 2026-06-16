import { type QueryKey, MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { DefaultCatchBoundary } from "~/components/default-catch-boundary";
import { DefaultNotFound } from "~/components/default-not-found";

import { routeTree } from "./routeTree.gen";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidates?: QueryKey[];
      [key: string]: unknown;
    };
  }
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 2, // 2 minutes
      },
    },
    mutationCache: new MutationCache({
      // Invalidate all queries after every successful mutation (Remix semantic).
      // To scope revalidation, set meta: { invalidates: [["key"]] } on the mutation.
      // To exempt a query entirely, set staleTime: "static" on its queryOptions.
      onSuccess: (_data, _variables, _context, mutation) => {
        const invalidates = mutation.meta?.invalidates;
        if (invalidates) {
          for (const queryKey of invalidates) {
            void queryClient.invalidateQueries({ queryKey });
          }
        } else {
          void queryClient.invalidateQueries();
        }
      },
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient, user: undefined },
    defaultPreload: "intent",
    // react-query will handle data fetching & caching
    // https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: DefaultNotFound,
    scrollRestoration: true,
    defaultStructuralSharing: true,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    handleRedirects: true,
    wrapQueryClient: true,
  });

  return router;
}
