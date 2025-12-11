/**
 * React Hook for Subscription Status
 * 
 * Provides real-time subscription status with automatic updates and error handling.
 * Implements Requirements 4.1, 4.2, 4.3 from the secure payment flow spec.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subscriptionStatusService, SubscriptionStatus, AccessResult } from '../lib/subscription/SubscriptionStatusService';

interface UseSubscriptionStatusOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSubscriptionStatusReturn {
  status: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  checkAccess: (feature: string) => Promise<AccessResult>;
  retryCount: number;
}

export function useSubscriptionStatus({
  userId,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: UseSubscriptionStatusOptions): UseSubscriptionStatusReturn {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Requirement 4.1: Load subscription status on mount
  const loadStatus = useCallback(async (showLoading = true) => {
    if (!userId) return;
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🔄 Loading subscription status for user:', userId);
      const newStatus = await subscriptionStatusService.getSubscriptionStatusWithRetry(userId);
      
      if (mountedRef.current) {
        setStatus(newStatus);
        setError(null);
        setRetryCount(0);
        console.log('✅ Subscription status loaded:', newStatus);
      }
    } catch (err) {
      console.error('❌ Failed to load subscription status:', err);
      
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription status');
        setRetryCount(prev => prev + 1);
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, [userId]);

  // Requirement 4.2: Set up real-time subscription updates
  useEffect(() => {
    if (!userId) return;

    const setupRealTimeUpdates = async () => {
      try {
        await subscriptionStatusService.subscribeToStatusChanges(userId, (newStatus) => {
          console.log('📡 Real-time subscription update received:', newStatus);
          if (mountedRef.current) {
            setStatus(newStatus);
            setError(null);
          }
        });
      } catch (err) {
        console.error('❌ Failed to set up real-time updates:', err);
      }
    };

    setupRealTimeUpdates();
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    refreshIntervalRef.current = setInterval(() => {
      loadStatus(false); // Don't show loading for background refreshes
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadStatus, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Requirement 4.3: Manual refresh function
  const refresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      await subscriptionStatusService.refreshSubscriptionCache(userId);
      await loadStatus();
    } catch (err) {
      console.error('❌ Failed to refresh subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription status');
    }
  }, [userId, loadStatus]);

  // Feature access check
  const checkAccess = useCallback(async (feature: string): Promise<AccessResult> => {
    if (!userId) {
      return {
        allowed: false,
        hasAccess: false,
        reason: 'User not authenticated',
        upgradeRequired: true
      };
    }

    try {
      return await subscriptionStatusService.validateSubscriptionAccess(userId, feature);
    } catch (err) {
      console.error('❌ Failed to check feature access:', err);
      return {
        allowed: false,
        hasAccess: false,
        reason: 'Error checking access',
        upgradeRequired: false
      };
    }
  }, [userId]);

  return {
    status,
    loading,
    error,
    refresh,
    checkAccess,
    retryCount
  };
}

/**
 * Hook for checking specific feature access
 */
export function useFeatureAccess(userId: string, feature: string) {
  const [access, setAccess] = useState<AccessResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !feature) return;

    const checkAccess = async () => {
      setLoading(true);
      try {
        const result = await subscriptionStatusService.validateSubscriptionAccess(userId, feature);
        setAccess(result);
      } catch (err) {
        console.error('❌ Failed to check feature access:', err);
        setAccess({
          allowed: false,
          hasAccess: false,
          reason: 'Error checking access',
          upgradeRequired: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [userId, feature]);

  return { access, loading };
}

/**
 * Hook for subscription status with automatic error recovery
 */
export function useSubscriptionStatusWithRecovery(userId: string) {
  const baseHook = useSubscriptionStatus({ userId });
  const [isRecovering, setIsRecovering] = useState(false);

  // Automatic error recovery
  useEffect(() => {
    if (baseHook.error && baseHook.retryCount < 3 && !isRecovering) {
      setIsRecovering(true);
      
      const retryDelay = Math.min(1000 * Math.pow(2, baseHook.retryCount), 10000);
      
      setTimeout(async () => {
        try {
          await baseHook.refresh();
        } finally {
          setIsRecovering(false);
        }
      }, retryDelay);
    }
  }, [baseHook.error, baseHook.retryCount, baseHook.refresh, isRecovering]);

  return {
    ...baseHook,
    isRecovering
  };
}
