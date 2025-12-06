'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * QueryProvider
 *
 * Provides TanStack Query (React Query) context to the application.
 * Configures default query and mutation options.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance per component mount
  // This ensures no state is shared between server/client or different requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus by default
            // Individual queries can override this
            refetchOnWindowFocus: false,

            // Refetch when connection is restored
            refetchOnReconnect: true,

            // Retry failed requests once
            retry: 1,

            // Cache data for 5 minutes before considering it stale
            staleTime: 5 * 60 * 1000,

            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
