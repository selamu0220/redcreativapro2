'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { checkSubscriptionStatus, SubscriptionStatus } from '../lib/middleware/subscription'

// Cache interface for subscription data
interface SubscriptionCache {
  data: SubscriptionStatus | null
  timestamp: number
  userId: string
}

// Performance monitoring interface
interface PerformanceMetrics {
  subscriptionCheckTime: number
  cacheHits: number
  cacheMisses: number
  errors: number
}

// Cache duration: 5 minutes for active subscriptions, 1 minute for free users
const CACHE_DURATION_PREMIUM = 5 * 60 * 1000 // 5 minutes
const CACHE_DURATION_FREE = 1 * 60 * 1000 // 1 minute
const BACKGROUND_REFRESH_THRESHOLD = 0.8 // Refresh when 80% of cache time has passed

// Global cache to persist across component unmounts
let globalSubscriptionCache: SubscriptionCache | null = null
let globalPerformanceMetrics: PerformanceMetrics = {
  subscriptionCheckTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0
}

export interface OptimizedAuthState {
  // Auth state from useAuth
  user: any
  loading: boolean
  isInitializing: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Optimized subscription state
  subscriptionStatus: SubscriptionStatus | null
  subscriptionLoading: boolean
  subscriptionError: string | null
  
  // Premium access helpers
  isPremium: boolean
  hasFeatureAccess: (feature: string) => boolean
  
  // Performance metrics
  performanceMetrics: PerformanceMetrics
  
  // Cache management
  refreshSubscription: () => Promise<void>
  clearCache: () => void
}

export function useOptimizedAuth(): OptimizedAuthState {
  const auth = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const backgroundRefreshRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Check if cache is valid
  const isCacheValid = useCallback((cache: SubscriptionCache | null, userId: string): boolean => {
    if (!cache || cache.userId !== userId) return false
    
    const now = Date.now()
    const cacheAge = now - cache.timestamp
    const maxAge = cache.data?.isActive ? CACHE_DURATION_PREMIUM : CACHE_DURATION_FREE
    
    return cacheAge < maxAge
  }, [])

  // Check if background refresh is needed
  const needsBackgroundRefresh = useCallback((cache: SubscriptionCache | null): boolean => {
    if (!cache) return false
    
    const now = Date.now()
    const cacheAge = now - cache.timestamp
    const maxAge = cache.data?.isActive ? CACHE_DURATION_PREMIUM : CACHE_DURATION_FREE
    const refreshThreshold = maxAge * BACKGROUND_REFRESH_THRESHOLD
    
    return cacheAge > refreshThreshold
  }, [])

  // Fetch subscription status with performance monitoring
  const fetchSubscriptionStatus = useCallback(async (userId: string, isBackground = false): Promise<SubscriptionStatus | null> => {
    const startTime = performance.now()
    
    try {
      const status = await checkSubscriptionStatus(userId)
      const endTime = performance.now()
      
      // Update performance metrics
      globalPerformanceMetrics.subscriptionCheckTime = endTime - startTime
      
      // Update cache
      globalSubscriptionCache = {
        data: status,
        timestamp: Date.now(),
        userId
      }
      
      if (!isBackground) {
        globalPerformanceMetrics.cacheMisses++
      }
      
      return status
    } catch (error) {
      globalPerformanceMetrics.errors++
      console.error('Error fetching subscription status:', error)
      throw error
    }
  }, [])

  // Background refresh function
  const scheduleBackgroundRefresh = useCallback((userId: string) => {
    if (backgroundRefreshRef.current) {
      clearTimeout(backgroundRefreshRef.current)
    }
    
    const cache = globalSubscriptionCache
    if (!cache) return
    
    const refreshDelay = cache.data?.isActive ? CACHE_DURATION_PREMIUM * 0.8 : CACHE_DURATION_FREE * 0.8
    
    backgroundRefreshRef.current = setTimeout(async () => {
      if (!mountedRef.current) return
      
      try {
        const newStatus = await fetchSubscriptionStatus(userId, true)
        if (mountedRef.current && newStatus) {
          setSubscriptionStatus(newStatus)
        }
      } catch (error) {
        console.warn('Background subscription refresh failed:', error)
      }
    }, refreshDelay)
  }, [fetchSubscriptionStatus])

  // Main subscription check function
  const checkSubscription = useCallback(async (userId: string) => {
    // Check cache first
    if (isCacheValid(globalSubscriptionCache, userId)) {
      globalPerformanceMetrics.cacheHits++
      setSubscriptionStatus(globalSubscriptionCache!.data)
      setSubscriptionLoading(false)
      setSubscriptionError(null)
      
      // Schedule background refresh if needed
      if (needsBackgroundRefresh(globalSubscriptionCache)) {
        scheduleBackgroundRefresh(userId)
      }
      
      return
    }
    
    // Fetch fresh data
    setSubscriptionLoading(true)
    setSubscriptionError(null)
    
    try {
      const status = await fetchSubscriptionStatus(userId)
      
      if (mountedRef.current) {
        setSubscriptionStatus(status)
        setSubscriptionLoading(false)
        
        // Schedule next background refresh
        scheduleBackgroundRefresh(userId)
      }
    } catch (error) {
      if (mountedRef.current) {
        setSubscriptionError(error instanceof Error ? error.message : 'Error desconocido')
        setSubscriptionLoading(false)
        
        // Use cached data if available, even if expired
        if (globalSubscriptionCache?.userId === userId) {
          setSubscriptionStatus(globalSubscriptionCache.data)
        }
      }
    }
  }, [isCacheValid, needsBackgroundRefresh, scheduleBackgroundRefresh, fetchSubscriptionStatus])

  // Manual refresh function
  const refreshSubscription = useCallback(async () => {
    if (!auth.user?.uid) return
    
    // Clear cache and force refresh
    globalSubscriptionCache = null
    await checkSubscription(auth.user.uid)
  }, [auth.user?.uid, checkSubscription])

  // Clear cache function
  const clearCache = useCallback(() => {
    globalSubscriptionCache = null
    if (backgroundRefreshRef.current) {
      clearTimeout(backgroundRefreshRef.current)
      backgroundRefreshRef.current = null
    }
  }, [])

  // Feature access helper
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    return subscriptionStatus?.isActive && subscriptionStatus.features.includes(feature) || false
  }, [subscriptionStatus])

  // Effect to check subscription when user changes
  useEffect(() => {
    if (auth.user?.uid && !auth.loading && !auth.isInitializing) {
      checkSubscription(auth.user.uid)
    } else if (!auth.user) {
      // Clear subscription data when user logs out
      setSubscriptionStatus(null)
      setSubscriptionLoading(false)
      setSubscriptionError(null)
      clearCache()
    }
  }, [auth.user?.uid, auth.loading, auth.isInitializing, checkSubscription, clearCache])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    
    return () => {
      mountedRef.current = false
      if (backgroundRefreshRef.current) {
        clearTimeout(backgroundRefreshRef.current)
      }
    }
  }, [])

  return {
    // Auth state
    user: auth.user,
    loading: auth.loading,
    isInitializing: auth.isInitializing,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    
    // Subscription state
    subscriptionStatus,
    subscriptionLoading,
    subscriptionError,
    
    // Premium access helpers
    isPremium: subscriptionStatus?.isActive || false,
    hasFeatureAccess,
    
    // Performance metrics
    performanceMetrics: globalPerformanceMetrics,
    
    // Cache management
    refreshSubscription,
    clearCache
  }
}

// Hook for quick premium check (optimized for performance)
export function useIsPremiumOptimized(): boolean {
  const { isPremium } = useOptimizedAuth()
  return isPremium
}

// Hook for feature access check (optimized for performance)
export function useFeatureAccessOptimized(feature: string): boolean {
  const { hasFeatureAccess } = useOptimizedAuth()
  return hasFeatureAccess(feature)
}

// Performance monitoring hook
export function useAuthPerformanceMetrics(): PerformanceMetrics {
  const { performanceMetrics } = useOptimizedAuth()
  return performanceMetrics
}
