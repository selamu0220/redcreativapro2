'use client'

import useSWR from 'swr'
import { useUser } from '@clerk/nextjs'

export interface UserStats {
  dailyTextsGenerated: number
  dailyEmailsSent: number
  dailyPrompts: number
  last30DaysTextsGenerated: number
  last30DaysEmailsSent: number
  last30DaysPrompts: number
  userSince: string
  lastActive: string
}

export function useUserStats() {
  const { isLoaded, isSignedIn, user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const { data, error, mutate, isLoading } = useSWR<UserStats>(
    isLoaded && isSignedIn && email ? `/api/stats?email=${encodeURIComponent(email)}` : null,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    stats: data,
    isLoading: (!data && !error) || isLoading,
    isError: error,
    mutate
  }
}
