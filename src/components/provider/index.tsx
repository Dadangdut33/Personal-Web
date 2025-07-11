'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

import TextLoad from '@/components/loading/loader-text'

const queryClient = new QueryClient()

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<TextLoad />}>{children}</Suspense>
    </QueryClientProvider>
  )
}
