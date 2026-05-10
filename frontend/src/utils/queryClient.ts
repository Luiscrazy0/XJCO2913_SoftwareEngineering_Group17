import { QueryClient } from '@tanstack/react-query'

// Create a client with global configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Avoid excessive retries
      refetchOnWindowFocus: false, // Reduce interference
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cache time)
    },
    mutations: {
      retry: 0, // Mutations must not auto-retry — side effects on first attempt would make retries fail
    },
  },
})