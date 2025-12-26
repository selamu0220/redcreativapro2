'use client'

import useSWR from 'swr'
import { useUser } from '@clerk/nextjs'

export interface SubscriptionStatus {
  isPremium: boolean
  plan: string
  status: string
  isActive: boolean
  expiresAt?: string
}

export function useSubscriptionStatus() {
  const { isLoaded, isSignedIn, user } = useUser()

  const { data, error, mutate, isLoading } = useSWR<SubscriptionStatus>(
    isLoaded && isSignedIn ? '/api/subscription/status' : null,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    status: data,
    isLoading: (!data && !error) || isLoading,
    isError: error,
    isPremium: data?.isPremium || false,
    plan: data?.plan || 'free',
    isActive: data?.isActive || false,
    mutate
  }
}
