'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSafeAuth } from './useSafeAuth'

export interface SubscriptionData {
  subscriptionPlan?: string
  plan: string
  status: string
  isActive?: boolean
  expiresAt?: string
  nextBillingDate?: string
  customerId?: string
  features: string[]
}

export function useSubscription() {
  const { user, isLoading: isAuthLoading } = useSafeAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!user?.email) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/subscription/status?email=${encodeURIComponent(user.email)}`)

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    if (!isAuthLoading) {
      fetchSubscription()
    }
  }, [isAuthLoading, fetchSubscription])

  const cancelSubscription = useCallback(async () => {
    if (!user?.email) {
      throw new Error('User not authenticated')
    }

    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    await fetchSubscription()
  }, [user?.email, fetchSubscription])

  const createCheckoutSession = useCallback(async () => {
    if (!user?.email) {
      throw new Error('User not authenticated')
    }

    const response = await fetch('/api/subscription/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const data = await response.json()
    if (data.url) {
      window.location.href = data.url
    }
  }, [user?.email])

  return {
    subscription,
    subscriptionData: subscription, // Alias for backward compatibility
    isLoading: isAuthLoading || isLoading,
    loading: isAuthLoading || isLoading, // Alias for backward compatibility
    error,
    refresh: fetchSubscription,
    cancelSubscription,
    createCheckoutSession
  }
}

export function usePremiumTheme() {
  const { user, isLoading: isAuthLoading } = useSafeAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user?.email) {
        setIsPremium(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/subscription/status?email=${encodeURIComponent(user.email)}`)
        if (response.ok) {
          const data = await response.json()
          setIsPremium(data?.isActive || false)
        }
      } catch (err) {
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading) {
      checkPremiumStatus()
    }
  }, [user?.email, isAuthLoading])

  const premiumBgClass = 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
  const premiumTextClass = 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600'
  const premiumBorderClass = 'border-2 border-amber-300 shadow-lg shadow-amber-200/50'
  const premiumButtonClass = 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white'

  const getThemeClasses = (defaultClasses: string, premiumClasses: string) => {
    return isPremium ? premiumClasses : defaultClasses
  }

  return {
    isPremium,
    isLoading,
    premiumBgClass,
    premiumTextClass,
    premiumBorderClass,
    premiumButtonClass,
    getThemeClasses
  }
}
