import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { createQueryClient } from "@/lib/query-client";

export function getRouter() {
  const queryClient = createQueryClient();

  // On itch.io the shell is served from a game-mirror subpath, often ending in
  // index.html. Strip that filename and teach the router the remaining prefix
  // so the single "/" route still matches. Other builds keep normal behavior.
  const itchBuild = import.meta.env.VITE_ITCH_STATIC === "1" && typeof window !== "undefined";
  if (itchBuild && /\/index\.html$/.test(window.location.pathname)) {
    const clean = window.location.pathname.slice(0, -"index.html".length) || "/";
    window.history.replaceState(
      window.history.state,
      "",
      clean + window.location.search + window.location.hash,
    );
  }
  const itchBase = itchBuild ? window.location.pathname.replace(/\/+$/, "") || "/" : null;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    ...(itchBase && itchBase !== "/" ? { basepath: itchBase } : {}),
  });
  // Provides QueryClientProvider and ships queries fetched during SSR to the browser cache.
  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}
