'use client';

import { useUser } from '@clerk/nextjs';
import useSWR from 'swr';

export interface PremiumAccessState {
  isActive: boolean;
  isPremium: boolean;
  plan: string;
  features: string[];
  loading: boolean;
}

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
  'basic_ai_limit',
  'standard_templates'
];

export function usePremiumAccess() {
  const { user, isLoaded, isSignedIn } = useUser();

  const { data, error, isLoading } = useSWR(
    isLoaded && isSignedIn ? '/api/subscription/status' : null,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const isPremium = data?.isPremium || false;
  const plan = data?.plan || 'free';
  const isActive = data?.isActive || false;

  return {
    isActive,
    isPremium,
    plan,
    features: isPremium ? [...PREMIUM_FEATURES, ...FREE_FEATURES] : FREE_FEATURES,
    loading: isLoading || !isLoaded,
    hasFeatureAccess: (feature: string) => (isPremium ? [...PREMIUM_FEATURES, ...FREE_FEATURES] : FREE_FEATURES).includes(feature),
    canUseFeature: (feature: string) => (isPremium ? [...PREMIUM_FEATURES, ...FREE_FEATURES] : FREE_FEATURES).includes(feature),
    isPremiumUser: () => isPremium,
    getPlanType: () => plan,
    isLifetimePlan: () => plan === 'lifetime',
    isMonthlyPlan: () => plan === 'monthly',
    isYearlyPlan: () => plan === 'yearly',
    canUseAdvancedAI: isPremium,
    canUseUnlimitedGenerations: isPremium,
    canUsePrioritySupport: isPremium,
    canUseAnalytics: isPremium,
    canUseBulkOperations: isPremium,
    canUseCustomTemplates: isPremium
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