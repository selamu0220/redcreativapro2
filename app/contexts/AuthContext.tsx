'use client'

import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  email: string
  user_metadata?: any
  uid: string // For backward compatibility - required
  displayName?: string // For backward compatibility
  created_at?: string
}

interface AuthContextType {
  user: any | null
  authUser: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  isInitializing: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
