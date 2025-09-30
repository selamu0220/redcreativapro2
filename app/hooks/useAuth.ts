'use client'

import { useAuthContext } from '../contexts/AuthContext'

export interface AuthUser {
  id: string
  email: string
  user_metadata?: any
}

export function useAuth() {
  const context = useAuthContext()
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  // Determine if we're still initializing authentication
  const isInitializing = context.isInitializing || (context.loading && !context.authUser)
  
  // Only consider user authenticated if we have a valid user and we're not initializing
  const isAuthenticated = !isInitializing && !!context.authUser && !!context.user

  return {
    user: context.authUser, // Return the AuthUser format for backward compatibility
    loading: context.loading,
    isInitializing, // Expose initialization state
    error: context.error,
    signIn: context.signIn,
    signUp: context.signUp,
    logout: context.logout,
    isAuthenticated,
    supabaseUser: context.user // Also provide access to the full Supabase user
  }
}