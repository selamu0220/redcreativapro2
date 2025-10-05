'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SubscriptionStatus, checkSubscriptionStatus } from '@/app/lib/subscription-middleware';
import { useUser } from '@/app/contexts/UserContext';

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
  const { user } = useUser();

  const refreshSubscription = async () => {
    if (!user?.id) {
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await checkSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus({
        planType: 'free',
        isActive: false,
        daysRemaining: 0,
        canAccessTools: false,
        subscription: null,
        trialInfo: null,
        expirationDate: null
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user?.id]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        refreshSubscription();
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