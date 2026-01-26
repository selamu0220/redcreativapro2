'use client';

import { useAuth } from './useAuth';

// Default fallback state for when auth is unavailable
const DEFAULT_AUTH_STATE = {
    isAuthenticated: false,
    isLoading: true,
    user: null as any,
    getToken: async () => null as string | null,
    permissions: {} as Record<string, boolean>,
    organization: null as any,
    userOrganizations: [] as any[],
};

/**
 * A safe wrapper that provides auth state compatible with legacy usage.
 * Now it just wraps the Supabase useAuth hook.
 */
export function useSafeAuth() {
    try {
        const auth = useAuth()
        return {
            ...auth,
            // Map Supabase auth state to structure expected by some components if needed
            getToken: async () => auth.session?.access_token || null,
            permissions: {}, // Kinde concept, irrelevant for now
            organization: null,
            userOrganizations: []
        }
    } catch (error) {
        // If used outside of provider, return default
        return DEFAULT_AUTH_STATE
    }
}
