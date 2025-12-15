'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export interface PremiumAccessState {
  isActive: boolean;
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'lifetime' | 'yearly';
  features: string[];
  loading: boolean;
}

// Global definition of features
const PREMIUM_FEATURES = [
  'advanced_ai',
  'unlimited_generations',
  'priority_support',
  'advanced_formatting',
  'custom_templates',
  'collaboration',
  'analytics',
  'api_access',
  'white_label',
  'bulk_operations'
];

const FREE_FEATURES = [
  'basic_ai_limit', // Placeholder for limited generations
  'standard_templates'
];

export function usePremiumAccess() {
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<PremiumAccessState>({
    isActive: false,
    isPremium: false,
    plan: 'free',
    features: FREE_FEATURES,
    loading: true
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setState({
        isActive: false,
        isPremium: false,
        plan: 'free',
        features: FREE_FEATURES,
        loading: false
      });
      return;
    }

    // Check Clerk Metadata for role
    // We look for 'role' or 'stripeRole' in publicMetadata
    // Supported premium roles: 'premium', 'pro', 'monthly', 'yearly', 'lifetime'
    const metadata = user.publicMetadata;
    const role = (metadata.role as string) || (metadata.stripeRole as string) || 'free';

    const isPremium = ['premium', 'pro', 'monthly', 'yearly', 'lifetime'].includes(role.toLowerCase());

    let plan: 'free' | 'monthly' | 'lifetime' | 'yearly' = 'free';
    if (isPremium) {
      if (role.toLowerCase().includes('monthly')) plan = 'monthly';
      else if (role.toLowerCase().includes('yearly')) plan = 'yearly';
      else if (role.toLowerCase().includes('lifetime')) plan = 'lifetime';
      else plan = 'monthly'; // Default to monthly if just generic 'premium'
    }

    setState({
      isActive: isPremium,
      isPremium: isPremium,
      plan: plan,
      features: isPremium ? [...PREMIUM_FEATURES, ...FREE_FEATURES] : FREE_FEATURES,
      loading: false
    });

  }, [user, isLoaded]);

  // Check feature access
  const hasFeatureAccess = async (feature: string): Promise<boolean> => {
    return state.features.includes(feature);
  };

  const canUseFeature = (feature: string): boolean => {
    return state.features.includes(feature);
  };

  return {
    ...state,
    features: state.features,
    hasFeatureAccess,
    canUseFeature,
    isPremiumUser: () => state.isPremium,
    getPlanType: () => state.plan,
    isLifetimePlan: () => state.plan === 'lifetime',
    isMonthlyPlan: () => state.plan === 'monthly',
    isYearlyPlan: () => state.plan === 'yearly',

    // Convenience flags
    canUseAdvancedAI: canUseFeature('advanced_ai'),
    canUseUnlimitedGenerations: canUseFeature('unlimited_generations'),
    canUsePrioritySupport: canUseFeature('priority_support'),
    canUseAnalytics: canUseFeature('analytics'),
    canUseBulkOperations: canUseFeature('bulk_operations'),
    canUseCustomTemplates: canUseFeature('custom_templates')
  };
}

// Simplified hooks
export function useIsPremium(): boolean {
  const { isPremium } = usePremiumAccess();
  return isPremium;
}

export function usePremiumLoading(): boolean {
  const { loading } = usePremiumAccess();
  return loading;
}