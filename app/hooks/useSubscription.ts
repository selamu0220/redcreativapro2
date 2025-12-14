'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

export interface SubscriptionData {
  hasSubscription: boolean
  isPremium: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  subscriptionId: string | null
  customerId: string | null
  stripeCustomerId?: string | null // Alias for customerId
  subscriptionEndDate: string | null
  subscriptionStartDate: string | null
  trialStartDate: string | null
  isLifetime: boolean
  isActive: boolean
  cancelAtPeriodEnd: boolean
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  lastPaymentStatus: string | null
  nextBillingDate: string | null
}

const defaultSubscriptionData: SubscriptionData = {
  hasSubscription: false,
  isPremium: false,
  subscriptionStatus: 'inactive',
  subscriptionPlan: 'free',
  subscriptionId: null,
  customerId: null,
  subscriptionEndDate: null,
  subscriptionStartDate: null,
  trialStartDate: null,
  isLifetime: false,
  isActive: false,
  cancelAtPeriodEnd: false,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  lastPaymentStatus: null,
  nextBillingDate: null
}

// Global cache to prevent multiple components from fetching simultaneously
// and to cache results for a short period.
const globalCache: {
  [email: string]: {
    data: SubscriptionData;
    timestamp: number;
    promise: Promise<SubscriptionData> | null;
  }
} = {};

const CACHE_DURATION = 1000 * 60; // 1 minute cache
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests

export function useSubscription() {
  const auth = useAuth()
  const authFetch = useAuthenticatedFetch()

  // Defensive checks to prevent crashes if contexts are missing
  const user = auth ? auth.user : null
  const post = authFetch ? authFetch.post : async () => ({ data: {} } as any)

  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(defaultSubscriptionData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local loading state ref to prevent state updates on unmounted components
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const fetchSubscriptionStatus = useCallback(async (force = false) => {
    if (!user?.email) {
      if (isMounted.current) {
        setSubscriptionData(defaultSubscriptionData)
        setLoading(false)
      }
      return
    }

    const email = user.email
    const now = Date.now()
    const cached = globalCache[email]

    // Use cache if available and fresh (unless forced)
    if (!force && cached && cached.data && (now - cached.timestamp < CACHE_DURATION)) {
      if (isMounted.current) {
        setSubscriptionData(cached.data)
        setLoading(false)
        console.log('📦 [SUBSCRIPTION] Usando datos en caché para:', email)
      }
      return
    }

    // Return existing promise if request is already in flight
    if (cached?.promise) {
      try {
        const data = await cached.promise
        if (isMounted.current) {
          setSubscriptionData(data)
          setLoading(false)
        }
      } catch (err) {
        // If the in-flight request fails, we might want to retry or just log
        console.error('❌ [SUBSCRIPTION] Error waiting for in-flight request:', err)
      }
      return
    }

    // Check rate limit (debounce)
    if (!force && cached && (now - cached.timestamp < MIN_REQUEST_INTERVAL)) {
      console.log('⏳ [SUBSCRIPTION] Petición demasiado reciente, ignorando...')
      return
    }

    try {
      if (isMounted.current) {
        setLoading(true)
        setError(null)
      }

      console.log('📊 [SUBSCRIPTION] Iniciando nueva petición para:', email)

      // Create request promise
      const requestPromise = post('/api/subscription/status', { userEmail: email })
        .then(response => {
          const data = response.data || response

          const subscriptionInfo: SubscriptionData = {
            hasSubscription: data.hasSubscription || false,
            isPremium: data.isPremium || false,
            subscriptionStatus: data.subscriptionStatus || 'inactive',
            subscriptionPlan: data.subscriptionPlan || 'free',
            subscriptionId: data.subscriptionId || null,
            customerId: data.customerId || null,
            subscriptionEndDate: data.subscriptionEndDate || null,
            subscriptionStartDate: data.subscriptionStartDate || null,
            trialStartDate: data.trialStartDate || null,
            isLifetime: data.subscriptionPlan === 'lifetime',
            isActive: data.isActive || false,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
            currentPeriodStart: data.currentPeriodStart || null,
            currentPeriodEnd: data.currentPeriodEnd || null,
            lastPaymentStatus: data.lastPaymentStatus || null,
            nextBillingDate: data.nextBillingDate || null
          }
          return subscriptionInfo
        })

      // Store promise in cache
      if (!globalCache[email]) {
        globalCache[email] = { data: defaultSubscriptionData, timestamp: 0, promise: null }
      }
      globalCache[email].promise = requestPromise

      const data = await requestPromise

      // Update cache
      globalCache[email] = {
        data,
        timestamp: Date.now(),
        promise: null
      }

      if (isMounted.current) {
        setSubscriptionData(data)
        console.log('✅ [SUBSCRIPTION] Estado actualizado:', data.subscriptionPlan)
      }
    } catch (err) {
      console.error('❌ [SUBSCRIPTION] Error fetching status:', err)
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setSubscriptionData(defaultSubscriptionData)
      }

      // Clear promise on error so we can try again
      if (globalCache[email]) {
        globalCache[email].promise = null
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [user?.email, post])

  const cancelSubscription = async (immediate: boolean = false) => {
    if (!user?.email || !subscriptionData.subscriptionId) {
      throw new Error('No subscription to cancel')
    }

    try {
      const result = await post('/api/subscription/cancel', {
        email: user.email,
        immediate
      })

      // Refresh subscription status after cancellation
      await fetchSubscriptionStatus()

      return result
    } catch (err) {
      console.error('Error canceling subscription:', err)
      throw err
    }
  }

  const createCheckoutSession = async (priceId: string, planName: string) => {
    if (!user?.email) {
      throw new Error('User email is required')
    }

    try {
      console.log('🛒 Creating checkout session:', { priceId, planName, userEmail: user.email });

      const data = await post('/api/subscription/create', {
        priceId,
        planName,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/planes?canceled=true`
      })

      // Redirect to Stripe Checkout
      if (data.url) {
        console.log('✅ Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('❌ Error creating checkout session:', err)
      throw err
    }
  }

  const refreshSubscription = () => {
    fetchSubscriptionStatus()
  }

  const getTrialDaysRemaining = () => {
    if (!subscriptionData.trialStartDate) {
      return 0
    }

    const trialStart = new Date(subscriptionData.trialStartDate)
    const now = new Date()
    const trialDurationMs = 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
    const trialEndDate = new Date(trialStart.getTime() + trialDurationMs)

    if (now >= trialEndDate) {
      return 0
    }

    const remainingMs = trialEndDate.getTime() - now.getTime()
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))

    return Math.max(0, remainingDays)
  }

  // Fetch subscription status when user changes or component mounts
  useEffect(() => {
    fetchSubscriptionStatus()
  }, [user?.email])

  // Auto-refresh subscription status every 10 minutes (reducido para evitar sobrecarga)
  // Auto-refresh subscription status every 10 minutes (reducido para evitar sobrecarga)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.email) {
        console.log('🔄 [SUBSCRIPTION] Actualización automática programada')
        fetchSubscriptionStatus()
      }
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [user?.email])

  // Real-time subscription status updates
  useEffect(() => {
    if (!user?.email) return

    // Subscribe to real-time status changes
    const handleStatusChange = (newStatus: any) => {
      console.log('🔄 [SUBSCRIPTION] Real-time status update received:', newStatus)

      const updatedData: SubscriptionData = {
        hasSubscription: newStatus.isActive || false,
        isPremium: newStatus.isActive || false,
        subscriptionStatus: newStatus.isActive ? 'active' : 'inactive',
        subscriptionPlan: newStatus.planId || 'free',
        subscriptionId: subscriptionData.subscriptionId,
        customerId: subscriptionData.customerId,
        subscriptionEndDate: newStatus.expiresAt || null,
        subscriptionStartDate: subscriptionData.subscriptionStartDate,
        trialStartDate: subscriptionData.trialStartDate,
        isLifetime: newStatus.planId === 'lifetime',
        isActive: newStatus.isActive || false,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        currentPeriodStart: subscriptionData.currentPeriodStart,
        currentPeriodEnd: newStatus.expiresAt || null,
        lastPaymentStatus: subscriptionData.lastPaymentStatus,
        nextBillingDate: newStatus.expiresAt || null
      }

      setSubscriptionData(updatedData)
    }

    // Listen for subscription status changes via custom events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `subscription_status_${user.email}` && e.newValue) {
        try {
          const newStatus = JSON.parse(e.newValue)
          handleStatusChange(newStatus)
        } catch (error) {
          console.error('Error parsing subscription status update:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user?.email, subscriptionData])

  return {
    subscriptionData,
    loading,
    error,
    cancelSubscription,
    createCheckoutSession,
    refreshSubscription,
    getTrialDaysRemaining,
    // Convenience getters
    isPremium: subscriptionData.isPremium,
    hasSubscription: subscriptionData.hasSubscription,
    isLifetime: subscriptionData.isLifetime,
    isActive: subscriptionData.isActive,
    subscriptionPlan: subscriptionData.subscriptionPlan,
    subscriptionStatus: subscriptionData.subscriptionStatus
  }
}

// Hook for checking if user has access to premium features
export function usePremiumAccess() {
  const { subscriptionData, loading } = useSubscription()

  return {
    hasAccess: subscriptionData.isPremium && subscriptionData.isActive,
    loading,
    subscriptionData
  }
}

// Hook for premium UI theming
export function usePremiumTheme() {
  const { subscriptionData } = useSubscription()

  const getThemeClasses = (baseClasses: string, premiumClasses: string) => {
    return subscriptionData.isPremium
      ? `${baseClasses} ${premiumClasses}`
      : baseClasses
  }

  const getPremiumStyles = () => {
    if (!subscriptionData.isPremium) return {}

    return {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderColor: '#fbbf24',
      color: '#b45309'
    }
  }

  return {
    isPremium: subscriptionData.isPremium,
    getThemeClasses,
    getPremiumStyles,
    premiumTextClass: subscriptionData.isPremium ? 'premium-text' : '',
    premiumBgClass: subscriptionData.isPremium ? 'premium-bg-subtle' : '',
    premiumBorderClass: subscriptionData.isPremium ? 'premium-border' : '',
    premiumButtonClass: subscriptionData.isPremium ? 'premium-button' : ''
  }
}