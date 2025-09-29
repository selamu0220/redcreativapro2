'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { SubscriptionStatus, checkSubscriptionStatus, getPlanLimits } from '../lib/middleware/subscription';

export interface SubscriptionData {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: 'monthly' | 'lifetime' | 'discounted';
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  dailyGenerations: number;
  documentsPerMonth: number;
  totalGenerations: number;
  lastResetDate: string;
}

export interface BillingInfo {
  nextBillingDate?: Date;
  amount?: number;
  currency?: string;
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
}

export function useSubscriptionManagement() {
  const { user } = useAuth();
  const { post } = useAuthenticatedFetch();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de suscripción
  const loadSubscriptionData = useCallback(async () => {
    if (!user || !supabase) {
      setSubscription(null);
      setSubscriptionStatus(null);
      setUsageStats(null);
      setBillingInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener datos de suscripción
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      setSubscription(subscriptionData);

      // Obtener estado de suscripción
      const status = await checkSubscriptionStatus(user.uid);
      setSubscriptionStatus(status);

      // Obtener estadísticas de uso
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.uid)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.warn('Error loading usage stats:', usageError);
      }

      setUsageStats(usageData || {
        dailyGenerations: 0,
        documentsPerMonth: 0,
        totalGenerations: 0,
        lastResetDate: new Date().toISOString()
      });

      // Obtener información de facturación si hay suscripción activa
      if (subscriptionData && subscriptionData.status === 'active') {
        await loadBillingInfo(subscriptionData.stripe_customer_id);
      }

    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar información de facturación
  const loadBillingInfo = async (customerId: string) => {
    try {
      const billing = await post('/api/stripe/billing-info', { customerId });
      setBillingInfo(billing);
    } catch (err) {
      console.warn('Error loading billing info:', err);
    }
  };

  // Cancelar suscripción
  const cancelSubscription = async () => {
    if (!subscription) return false;

    try {
      await post('/api/stripe/cancel-subscription', { 
        subscriptionId: subscription.stripe_subscription_id 
      });
      await loadSubscriptionData();
      return true;
    } catch (err) {
      console.error('Error canceling subscription:', err);
      return false;
    }
  };

  // Reactivar suscripción
  const reactivateSubscription = async () => {
    if (!subscription) return false;

    try {
      await post('/api/stripe/reactivate-subscription', { 
        subscriptionId: subscription.stripe_subscription_id 
      });
      await loadSubscriptionData();
      return true;
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      return false;
    }
  };

  // Actualizar método de pago
  const updatePaymentMethod = async () => {
    if (!subscription) return null;

    try {
      const { url } = await post('/api/stripe/create-portal-session', { 
        customerId: subscription.stripe_customer_id,
        returnUrl: window.location.href
      });
      return url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      return null;
    }
  };

  // Incrementar uso diario
  const incrementUsage = async (type: 'generation' | 'document') => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase.rpc('increment_user_usage', {
        p_user_id: user.uid,
        p_type: type
      });

      if (error) {
        console.error('Error incrementing usage:', error);
      } else {
        // Recargar estadísticas de uso
        await loadSubscriptionData();
      }
    } catch (err) {
      console.error('Error incrementing usage:', err);
    }
  };

  // Verificar si se puede usar una característica
  const canUseFeature = (feature: string): boolean => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.features.includes(feature);
  };

  // Obtener límites del plan actual
  const getPlanLimitsForUser = () => {
    const plan = subscriptionStatus?.plan || 'free';
    return getPlanLimits(plan);
  };

  // Verificar si se ha alcanzado un límite
  const hasReachedLimit = (limitType: 'dailyGenerations' | 'documentsPerMonth'): boolean => {
    if (!usageStats) return false;
    
    const limits = getPlanLimitsForUser();
    const limit = limits[limitType];
    
    if (limit === -1) return false; // Ilimitado
    
    const usage = usageStats[limitType];
    return usage >= limit;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.uid}`
        },
        () => {
          loadSubscriptionData();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, loadSubscriptionData]);

  return {
    // Datos
    subscription,
    subscriptionStatus,
    usageStats,
    billingInfo,
    loading,
    error,
    
    // Funciones
    loadSubscriptionData,
    cancelSubscription,
    reactivateSubscription,
    updatePaymentMethod,
    incrementUsage,
    canUseFeature,
    getPlanLimitsForUser,
    hasReachedLimit,
    
    // Helpers
    isActive: subscriptionStatus?.isActive || false,
    isPremium: subscriptionStatus?.isActive || false,
    planType: subscriptionStatus?.plan || 'free',
    daysUntilExpiry: subscription?.expires_at 
      ? Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null
  };
}