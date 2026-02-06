import { createRouter, type AnyRouter } from '@tanstack/react-router'
import {
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
  dehydrate,
  hydrate,
} from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import type { RouterContext } from '@/lib/router/context'

export function getRouter(): AnyRouter {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: (failureCount, error) => {
          const status =
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            (error as { response?: { status?: number } }).response?.status
              ? Number(
                  (error as { response?: { status?: number } }).response
                    ?.status,
                )
              : undefined
          if (status && status >= 400 && status < 500) {
            return false
          }
          return failureCount < 2
        },
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    } satisfies RouterContext,
    dehydrate: () => {
      const queryClientState: Record<string, object> = JSON.parse(
        JSON.stringify(dehydrate(queryClient)),
      )
      return {
        queryClientState,
      }
    },
    hydrate: (dehydrated) => {
      if (
        dehydrated?.queryClientState &&
        isDehydratedState(dehydrated.queryClientState)
      ) {
        hydrate(queryClient, dehydrated.queryClientState)
      }
    },
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    defaultPreload: 'intent',
    scrollRestoration: true,
    ssr: {
      nonce: import.meta.env.VITE_CSP_NONCE,
    },
  })

  return router
}

function isDehydratedState(value: unknown): value is DehydratedState {
  if (!value || typeof value !== 'object') {
    return false
  }
  if (!('queries' in value) || !('mutations' in value)) {
    return false
  }
  const { queries, mutations } = value
  return Array.isArray(queries) && Array.isArray(mutations)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
