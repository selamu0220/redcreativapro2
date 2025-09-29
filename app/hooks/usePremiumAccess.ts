'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkSubscriptionStatus, checkFeatureAccess } from '../lib/middleware/subscription';

export interface PremiumAccessState {
  isActive: boolean;
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'lifetime' | 'discounted';
  features: string[];
  loading: boolean;
  error: string | null;
}

export function usePremiumAccess() {
  const { user } = useAuth();
  const [state, setState] = useState<PremiumAccessState>({
    isActive: false,
    isPremium: false,
    plan: 'free',
    features: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      if (!user) {
        if (mounted) {
          setState({
            isActive: false,
            isPremium: false,
            plan: 'free',
            features: [],
            loading: false,
            error: null
          });
        }
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const status = await checkSubscriptionStatus(user.uid);
        
        if (mounted) {
          setState({
            isActive: status.isActive,
            isPremium: status.isActive,
            plan: status.plan,
            features: status.features,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          }));
        }
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Función para verificar acceso a una característica específica
  const hasFeatureAccess = async (feature: string): Promise<boolean> => {
    if (!user) return false;
    const result = await checkFeatureAccess(user.uid, feature);
    return result.hasAccess;
  };

  // Verificar si tiene acceso a una característica (sincrónico, basado en el estado actual)
  const canUseFeature = (feature: string): boolean => {
    return state.features.includes(feature);
  };

  // Verificar si es usuario premium
  const isPremiumUser = (): boolean => {
    return state.isPremium;
  };

  // Obtener el tipo de plan
  const getPlanType = (): string => {
    return state.plan;
  };

  // Verificar si el plan es de por vida
  const isLifetimePlan = (): boolean => {
    return state.plan === 'lifetime';
  };

  // Verificar si el plan es mensual
  const isMonthlyPlan = (): boolean => {
    return state.plan === 'monthly';
  };

  // Verificar si el plan tiene descuento
  const isDiscountedPlan = (): boolean => {
    return state.plan === 'discounted';
  };

  return {
    // Estado
    ...state,
    
    // Funciones de verificación
    hasFeatureAccess,
    canUseFeature,
    isPremiumUser,
    getPlanType,
    isLifetimePlan,
    isMonthlyPlan,
    isDiscountedPlan,
    
    // Características específicas (para facilitar el uso)
    canUseAdvancedAI: canUseFeature('advanced_ai'),
    canUseUnlimitedGenerations: canUseFeature('unlimited_generations'),
    canUsePrioritySupport: canUseFeature('priority_support'),
    canUseAdvancedFormatting: canUseFeature('advanced_formatting'),
    canUseCustomTemplates: canUseFeature('custom_templates'),
    canUseCollaboration: canUseFeature('collaboration'),
    canUseAnalytics: canUseFeature('analytics'),
    canUseAPIAccess: canUseFeature('api_access'),
    canUseWhiteLabel: canUseFeature('white_label'),
    canUseBulkOperations: canUseFeature('bulk_operations')
  };
}

// Hook simplificado para verificación rápida de premium
export function useIsPremium(): boolean {
  const { isPremium } = usePremiumAccess();
  return isPremium;
}

// Hook para obtener solo el estado de carga
export function usePremiumLoading(): boolean {
  const { loading } = usePremiumAccess();
  return loading;
}