'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

type SubscriptionStatus = 'free' | 'trial' | 'pro'

interface UserData {
  email: string
  subscriptionStatus: SubscriptionStatus
  dailyUsage: {
    date: string
    escritorIA: number
    correosIA: number
    prompts: number
  }
  registrationDate?: string
  trialStart?: string
  subscriptionStart?: string
}

interface UsageLimits {
  escritorIA: {
    used: number
    limit: number | 'unlimited'
    remaining: number | 'unlimited'
  }
  correosIA: {
    used: number
    limit: number | 'unlimited'
    remaining: number | 'unlimited'
  }
  prompts: {
    used: number
    limit: number | 'unlimited'
    remaining: number | 'unlimited'
  }
}

export function useSubscription() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (user?.email) {
      loadUserData()
    }
  }, [user?.email])

  const loadUserData = async () => {
    if (!user?.email) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/users/track-usage?email=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        setUsageLimits(data.limits)
      } else {
        console.error('Failed to load user data')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackUsage = async (tool: 'escritorIA' | 'correosIA' | 'prompts'): Promise<boolean> => {
    if (!user?.email) return false
    
    try {
      const response = await fetch('/api/users/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          tool,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Reload user data to get updated usage
        await loadUserData()
        return true
      } else if (response.status === 429) {
        const errorData = await response.json()
        alert(`Límite diario alcanzado para ${tool}. ${errorData.subscriptionStatus === 'free' || errorData.subscriptionStatus === 'trial' ? 'Actualiza a Pro para uso ilimitado.' : ''}`)
        return false
      }
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
    
    return false
  }

  const canUseFeature = (feature: 'escritorIA' | 'correosIA' | 'prompts'): boolean => {
    if (!usageLimits) return false
    const limit = usageLimits[feature]
    return limit.remaining === 'unlimited' || (typeof limit.remaining === 'number' && limit.remaining > 0)
  }

  const canImproveText = (): boolean => {
    return canUseFeature('escritorIA')
  }

  const getRemainingImprovements = (): number | 'unlimited' => {
    return getRemainingUsage('escritorIA')
  }

  const getRemainingUsage = (feature: 'escritorIA' | 'correosIA' | 'prompts'): number | 'unlimited' => {
    if (!usageLimits) return 0
    return usageLimits[feature].remaining
  }

  const getUsagePercentage = (feature?: 'escritorIA' | 'correosIA' | 'prompts'): number => {
    const targetFeature = feature || 'escritorIA'
    if (!usageLimits) return 0
    const limit = usageLimits[targetFeature]
    if (limit.limit === 'unlimited') return 0
    return Math.min(100, (limit.used / (limit.limit as number)) * 100)
  }

  const createCheckoutSession = async (planType: string = 'pro') => {
    if (!user?.email) {
      throw new Error('User email not found');
    }

    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        planType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.url;
  }

  const getTrialDaysRemaining = (): number => {
    if (!userData || userData.subscriptionStatus !== 'trial' || !userData.trialStart) {
      return 0
    }
    
    const trialStart = new Date(userData.trialStart)
    const now = new Date()
    const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 7 - daysPassed)
  }

  const incrementUsage = (type: 'improvement') => {
    return trackUsage('escritorIA')
  }

  const upgradeToPro = () => {
    return createCheckoutSession('pro')
  }

  return {
    subscription: userData ? { plan: userData.subscriptionStatus, isActive: userData.subscriptionStatus !== 'free' } : { plan: 'free', isActive: false },
    usage: userData ? { dailyImprovements: userData.dailyUsage?.escritorIA || 0, lastResetDate: userData.dailyUsage?.date || new Date().toDateString() } : { dailyImprovements: 0, lastResetDate: new Date().toDateString() },
    userData,
    usageLimits,
    loading,
    limits: usageLimits ? {
      dailyImprovements: usageLimits.escritorIA?.limit === 'unlimited' ? -1 : (usageLimits.escritorIA?.limit || 0),
      features: userData?.subscriptionStatus === 'pro' ? ['basic', 'advanced', 'email'] : ['basic']
    } : { dailyImprovements: 5, features: ['basic'] },
    canUseFeature,
    canImproveText,
    getRemainingImprovements,
    getRemainingUsage,
    getUsagePercentage,
    trackUsage,
    createCheckoutSession,
    getTrialDaysRemaining,
    incrementUsage,
    upgradeToPro,
    refreshData: loadUserData
  }
}