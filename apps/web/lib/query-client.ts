import { QueryClient, isServer } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Treat data as fresh for 1 minute before a background refetch.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        // Don't retry client errors (4xx) — they won't fix themselves.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: a fresh client per request so caches are never shared.
    return makeQueryClient();
  }
  // Browser: reuse a single client across renders (and Fast Refresh).
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
