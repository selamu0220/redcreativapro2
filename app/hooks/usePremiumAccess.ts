'use client';

import { useAuth } from './useAuth';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePremiumAccess() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data, error, isLoading } = useSWR(
    user?.email ? `/api/subscription/status?email=${encodeURIComponent(user.email)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    hasPremiumAccess: data?.hasPremiumAccess || data?.isActive || false,
    hasAccess: data?.hasPremiumAccess || data?.isActive || false, // Alias for backward compatibility
    isLoading: isAuthLoading || isLoading,
    loading: isAuthLoading || isLoading, // Alias for backward compatibility
    error,
    subscriptionData: data
  };
}
