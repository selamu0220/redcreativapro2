'use client'

// import { AuthContext as MinimalAuthContext } from '../components/MinimalProviders'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useMemo } from 'react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export interface AuthUser {
  id: string
  email: string
  user_metadata?: any
  displayName?: string
  uid?: string
  created_at?: string
  fullName?: string
  firstName?: string
  primaryEmailAddress?: {
    emailAddress: string
  }
}

export function useAuth() {
  const { user: kindeUser, isLoading, isAuthenticated } = useKindeBrowserClient()
  const working = useContext(AuthContext)
  // const minimal = useContext(MinimalAuthContext) // Comentado: MinimalProviders eliminado
  const minimal = null // Temporal

  // Memoize the bridged user to avoid unnecessary re-renders
  const user = useMemo(() => {
    if (isAuthenticated && kindeUser) {
      return {
        id: kindeUser.id,
        email: kindeUser.email || '',
        displayName: kindeUser.given_name || kindeUser.family_name || '',
        fullName: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim(),
        firstName: kindeUser.given_name || '',
        primaryEmailAddress: kindeUser.email ? { emailAddress: kindeUser.email } : undefined,
        uid: kindeUser.id,
        user_metadata: {}
      } as AuthUser
    }
    if (working?.authUser) return working.authUser
    if (minimal?.user) return minimal.user as unknown as AuthUser
    return null
  }, [isAuthenticated, kindeUser, working?.authUser, minimal?.user])

  // Compute final auth state based on priority: Kinde > Working > Minimal
  return useMemo(() => {
    // 1. Kinde Auth
    if (!isLoading && isAuthenticated) {
      return {
        user,
        userId: user?.id || null,
        loading: false,
        isInitializing: false,
        error: null,
        signIn: async () => {
          window.location.href = '/api/auth/login'
        },
        signUp: async () => {
          window.location.href = '/api/auth/register'
        },
        logout: async () => {
          window.location.href = '/api/auth/logout'
        },
        isAuthenticated: true
      }
    }

    // 2. Working Auth (Supabase/Firebase)
    if (working) {
      const signIn = typeof working.signIn === 'function' ? working.signIn : async () => { throw new Error('Auth provider not ready') }
      const signUp = typeof working.signUp === 'function' ? working.signUp : async () => { throw new Error('Auth provider not ready') }
      const logout = typeof working.logout === 'function' ? working.logout : async () => { }
      return {
        user: working.authUser || null,
        userId: working.authUser?.id || working.authUser?.uid || null,
        loading: working.loading,
        isInitializing: working.isInitializing,
        error: working.error || null,
        signIn,
        signUp,
        logout,
        isAuthenticated: working.isAuthenticated
      }
    }

    // 3. Minimal Auth (Mock/Local)
    if (minimal) {
      const signIn = typeof minimal.signIn === 'function' ? minimal.signIn : async () => { throw new Error('Auth provider not ready') }
      const signUp = typeof minimal.signUp === 'function' ? minimal.signUp : async () => { throw new Error('Auth provider not ready') }
      const logout = typeof minimal.logout === 'function' ? minimal.logout : async () => { }
      return {
        user: (minimal.user as unknown as AuthUser) || null,
        userId: (minimal.user as any)?.id || (minimal.user as any)?.uid || null,
        loading: minimal.loading,
        isInitializing: false,
        error: minimal.error,
        signIn,
        signUp,
        logout,
        isAuthenticated: minimal.isAuthenticated
      }
    }

    // Default: Not authenticated
    const signIn = async () => {
      window.location.href = '/api/auth/login'
    }
    const signUp = async () => {
      window.location.href = '/api/auth/register'
    }
    const logout = async () => {
      window.location.href = '/api/auth/logout'
    }
    return {
      user: null,
      userId: null,
      loading: isLoading,
      isInitializing: false,
      error: null,
      signIn,
      signUp,
      logout,
      isAuthenticated: false
    }
  }, [isLoading, isAuthenticated, user, working, minimal])
}
