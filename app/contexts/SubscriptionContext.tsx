'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SubscriptionStatus, checkSubscriptionStatus } from '@/app/lib/subscription-middleware';
import { useAuth } from '@/app/hooks/useAuth';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  isBlocked: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshSubscription = async () => {
    if (!user?.id) {
      // Set a default free status when no user
      setSubscriptionStatus({
        plan: 'free',
        planType: 'free',
        isActive: false,
        daysRemaining: 0,
        canAccessTools: false,
        subscription: null,
        trialInfo: null,
        expirationDate: null,
        features: []
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await checkSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } catch (error) {
      // The checkSubscriptionStatus function now handles all errors gracefully
      // and returns safe defaults, so this catch block should rarely be reached
      console.warn('Unexpected error in refreshSubscription:', error);
      setSubscriptionStatus({
        plan: 'free',
        planType: 'free',
        isActive: false,
        daysRemaining: 0,
        canAccessTools: false,
        subscription: null,
        trialInfo: null,
        expirationDate: null,
        features: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user?.id]);

  // Auto-refresh every 5 minutes, but with error resilience
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user?.id) {
        try {
          await refreshSubscription();
        } catch (error) {
          // Silently handle any errors to prevent breaking the interval
          console.warn('Auto-refresh subscription failed:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id]);

  const isBlocked = subscriptionStatus ? !subscriptionStatus.canAccessTools : true;

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        loading,
        refreshSubscription,
        isBlocked
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
