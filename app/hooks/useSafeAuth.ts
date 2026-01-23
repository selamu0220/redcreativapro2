'use client';

import { useState, useEffect, useContext, createContext } from 'react';

// Default fallback state for when auth is unavailable
const DEFAULT_AUTH_STATE = {
    isAuthenticated: false,
    isLoading: false,
    user: null as any,
    getToken: async () => null as string | null,
    permissions: {} as Record<string, boolean>,
    organization: null as any,
    userOrganizations: [] as any[],
};

/**
 * A safe wrapper that provides auth state without crashing.
 * Uses dynamic import to avoid hook-rule violations.
 */
export function useSafeAuth() {
    const [mounted, setMounted] = useState(false);
    const [authState, setAuthState] = useState(DEFAULT_AUTH_STATE);
    const [kindeAvailable, setKindeAvailable] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Dynamically import and check Kinde availability
        const checkKinde = async () => {
            try {
                // Check if KindeProvider is in the DOM (rendered)
                const kindeContextElement = document.querySelector('[data-kinde-provider="true"]');

                // Also try to fetch auth status from API
                const response = await fetch('/api/check-auth', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setAuthState({
                        isAuthenticated: data.isAuthenticated || false,
                        isLoading: false,
                        user: data.user || null,
                        getToken: async () => null,
                        permissions: data.permissions || {},
                        organization: data.organization || null,
                        userOrganizations: data.userOrganizations || [],
                    });
                    setKindeAvailable(true);
                } else {
                    // Not authenticated or API error - that's okay
                    setAuthState({ ...DEFAULT_AUTH_STATE, isLoading: false });
                }
            } catch (error) {
                // Silent fail - user is just not authenticated
                console.debug('[useSafeAuth] Auth check failed, treating as unauthenticated');
                setAuthState({ ...DEFAULT_AUTH_STATE, isLoading: false });
            }
        };

        checkKinde();
    }, []);

    // During SSR or before mount, return loading state
    if (!mounted) {
        return { ...DEFAULT_AUTH_STATE, isLoading: true };
    }

    return authState;
}
