'use client'

import useSWR from 'swr'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export interface UserStats {
  emailsGenerated: number
  documentsCreated: number
  aiRequestsToday: number
  subscriptionTier: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useUserStats() {
  const { user, isLoading: isAuthLoading } = useKindeBrowserClient()
  
  const { data, error, isLoading, mutate } = useSWR<UserStats>(
    user?.email ? `/api/user/stats?email=${encodeURIComponent(user.email)}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  return {
    stats: data,
    isLoading: isAuthLoading || isLoading,
    error,
    refresh: mutate
  }
}
