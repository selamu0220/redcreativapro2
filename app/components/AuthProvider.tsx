'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const { user: kindeUser, isLoading, isAuthenticated } = useKindeBrowserClient()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && kindeUser) {
        setAuthUser({
          id: kindeUser.id,
          email: kindeUser.email || '',
          user_metadata: {},
          displayName: kindeUser.given_name || kindeUser.family_name || '',
          uid: kindeUser.id,
        })
      } else {
        setAuthUser(null)
      }
      setLoading(false)
    }
  }, [isLoading, isAuthenticated, kindeUser])

  const signIn = async (email: string, password: string) => {
    window.location.href = '/api/auth/login'
  }

  const signUp = async (email: string, password: string) => {
    window.location.href = '/api/auth/register'
  }

  const logout = async () => {
    window.location.href = '/api/auth/logout'
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        loading,
        isInitializing: isLoading,
        error,
        signIn,
        signUp,
        logout,
        isAuthenticated: isAuthenticated || false
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
