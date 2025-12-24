'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'

export interface SubscriptionData {
  hasSubscription: boolean
  isPremium: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  subscriptionId: string | null
  customerId: string | null
  isActive: boolean
  // Keep compatibility with existing code
  subscriptionEndDate?: string | null
  nextBillingDate?: string | null
}

const defaultSubscriptionData: SubscriptionData = {
  hasSubscription: false,
  isPremium: false,
  subscriptionStatus: 'inactive',
  subscriptionPlan: 'free',
  subscriptionId: null,
  customerId: null,
  isActive: false
}

export function useSubscription() {
  const { user, isLoaded: userLoaded } = useUser()
  const { has, isLoaded: authLoaded } = useAuth()
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(defaultSubscriptionData)
  const [loading, setLoading] = useState(true)

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!userLoaded || !authLoaded) return

    if (!user) {
      setSubscriptionData(defaultSubscriptionData)
      setLoading(false)
      return
    }

    // Check plan using Clerk's has() helper
    // Supported plans in Clerk Billing (example slugs: 'pro', 'pro_monthly', 'pro_yearly')
    const isPro = has ? (has({ plan: 'pro' }) || has({ plan: 'pro_monthly' }) || has({ plan: 'pro_yearly' })) : false
    
    // Also check metadata as fallback if user hasn't fully migrated to Clerk Billing
    const metadataPlan = user.publicMetadata?.plan as string || 'free'
    const isPremiumMetadata = metadataPlan !== 'free'

    const active = isPro || isPremiumMetadata

    const data: SubscriptionData = {
      hasSubscription: active,
      isPremium: active,
      subscriptionStatus: active ? 'active' : 'inactive',
      subscriptionPlan: isPro ? 'pro' : metadataPlan,
      subscriptionId: null, // Clerk manages this internally
      customerId: null,
      isActive: active
    }

    setSubscriptionData(data)
    setLoading(false)
  }, [user, userLoaded, authLoaded, has])

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [fetchSubscriptionStatus])

  return {
    subscriptionData,
    loading,
    error: null,
    // Clerk PricingTable handles checkout/cancellation, so we return stubs for compatibility
    cancelSubscription: async () => { console.warn('Cancel managed by Clerk UserProfile') },
    createCheckoutSession: async () => { console.warn('Checkout managed by Clerk PricingTable') },
    refreshSubscription: fetchSubscriptionStatus,
    getTrialDaysRemaining: () => 0,
    // Convenience getters
    isPremium: subscriptionData.isPremium,
    hasSubscription: subscriptionData.hasSubscription,
    isActive: subscriptionData.isActive,
    subscriptionPlan: subscriptionData.subscriptionPlan,
    subscriptionStatus: subscriptionData.subscriptionStatus
  }
}

export function usePremiumAccess() {
  const { subscriptionData, loading } = useSubscription()
  return {
    hasAccess: subscriptionData.isPremium && subscriptionData.isActive,
    loading,
    subscriptionData
  }
}

export function usePremiumTheme() {
  const { subscriptionData } = useSubscription()
  return {
    isPremium: subscriptionData.isPremium,
    getThemeClasses: (base: string, premium: string) => subscriptionData.isPremium ? `${base} ${premium}` : base,
    getPremiumStyles: () => subscriptionData.isPremium ? {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderColor: '#fbbf24',
      color: '#b45309'
    } : {},
    premiumTextClass: subscriptionData.isPremium ? 'premium-text' : '',
    premiumBgClass: subscriptionData.isPremium ? 'premium-bg-subtle' : '',
    premiumBorderClass: subscriptionData.isPremium ? 'premium-border' : '',
    premiumButtonClass: subscriptionData.isPremium ? 'premium-button' : ''
  }
}
