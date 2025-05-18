'use client'

import { MedusaProvider } from "medusa-react"
import { QueryClient } from "@tanstack/react-query"

// Настройки React Query Client (можно кастомизировать)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
    },
  },
})

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MedusaProvider
      queryClientProviderProps={{ client: queryClient }}
      baseUrl={MEDUSA_BACKEND_URL}
    >
      {children}
    </MedusaProvider>
  )
} 