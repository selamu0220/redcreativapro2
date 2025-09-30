'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

export interface SubscriptionData {
  hasSubscription: boolean
  isPremium: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  subscriptionId: string | null
  customerId: string | null
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

export function useSubscription() {
  const { user } = useAuth()
  const { post } = useAuthenticatedFetch()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(defaultSubscriptionData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)

  const fetchSubscriptionStatus = async () => {
    if (!user?.email) {
      setSubscriptionData(defaultSubscriptionData)
      setLoading(false)
      return
    }

    // Evitar peticiones duplicadas
    if (isRequesting) {
      console.log('🔄 [SUBSCRIPTION] Petición ya en curso, omitiendo...')
      return
    }

    try {
      setIsRequesting(true)
      setLoading(true)
      setError(null)
      
      console.log('📊 [SUBSCRIPTION] Obteniendo estado de suscripción para:', user.email)
      
      const data = await post('/api/subscription/status', { userEmail: user.email })
      
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
      
      setSubscriptionData(subscriptionInfo)
      console.log('✅ [SUBSCRIPTION] Estado de suscripción actualizado:', subscriptionInfo.subscriptionPlan)
    } catch (err) {
      console.error('❌ [SUBSCRIPTION] Error fetching subscription status:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSubscriptionData(defaultSubscriptionData)
    } finally {
      setLoading(false)
      setIsRequesting(false)
    }
  }

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
      const data = await post('/api/subscription/create', {
        priceId,
        userEmail: user.email,
        planName
      })
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
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
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.email && !isRequesting) {
        console.log('🔄 [SUBSCRIPTION] Actualización automática programada')
        fetchSubscriptionStatus()
      }
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [user?.email, isRequesting])

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