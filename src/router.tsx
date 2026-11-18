import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // A soft cross-fade between pages in browsers that support it; others navigate as before.
    defaultViewTransition: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
