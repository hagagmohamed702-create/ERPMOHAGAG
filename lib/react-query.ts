import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep cache for 10 minutes (gcTime in v5)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

// Query keys factory
export const queryKeys = {
  all: ['data'] as const,
  clients: () => [...queryKeys.all, 'clients'] as const,
  client: (id: string) => [...queryKeys.clients(), id] as const,
  suppliers: () => [...queryKeys.all, 'suppliers'] as const,
  supplier: (id: string) => [...queryKeys.suppliers(), id] as const,
  projects: () => [...queryKeys.all, 'projects'] as const,
  project: (id: string) => [...queryKeys.projects(), id] as const,
  units: () => [...queryKeys.all, 'units'] as const,
  unit: (id: string) => [...queryKeys.units(), id] as const,
  contracts: () => [...queryKeys.all, 'contracts'] as const,
  contract: (id: string) => [...queryKeys.contracts(), id] as const,
  invoices: () => [...queryKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...queryKeys.invoices(), id] as const,
  payments: () => [...queryKeys.all, 'payments'] as const,
  payment: (id: string) => [...queryKeys.payments(), id] as const,
  installments: () => [...queryKeys.all, 'installments'] as const,
  installment: (id: string) => [...queryKeys.installments(), id] as const,
}