'use client'

import useSWR from 'swr'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export interface SubscriptionStatus {
  isActive: boolean
  plan: string
  expiresAt?: string
  features: string[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSubscriptionStatus() {
  const { user, isLoading: isAuthLoading } = useKindeBrowserClient()
  
  const { data, error, isLoading, mutate } = useSWR<SubscriptionStatus>(
    user?.email ? `/api/subscription/status?email=${encodeURIComponent(user.email)}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  )

  return {
    subscription: data,
    isLoading: isAuthLoading || isLoading,
    error,
    refresh: mutate
  }
}
