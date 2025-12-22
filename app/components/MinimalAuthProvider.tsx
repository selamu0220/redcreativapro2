'use client'

import { ReactNode } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function MinimalAuthProvider({ children }: AuthProviderProps) {
  // Stub provider - supabase removed, use WorkingAuthProvider instead
  const contextValue = {
    user: null,
    authUser: null,
    loading: false,
    isAuthenticated: false,
    signIn: async () => {},
    signUp: async () => {},
    logout: async () => {},
    error: '',
    isInitializing: false
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
