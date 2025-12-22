'use client'

import { useState, useEffect, ReactNode } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded } = useUser()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        setAuthUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          user_metadata: {},
          uid: clerkUser.id,
          displayName: clerkUser.fullName || clerkUser.username || ''
        })
      } else {
        setAuthUser(null)
      }
      setIsInitializing(false)
    }
  }, [clerkUser, isLoaded])

  const signIn = async (email: string, password: string) => {
    setError('Please use Clerk sign in')
  }

  const signUp = async (email: string, password: string) => {
    setError('Please use Clerk sign up')
  }

  const logout = async () => {
    router.push('/sign-out')
  }

  const contextValue = {
    user: clerkUser as any,
    authUser,
    loading,
    isAuthenticated: !!clerkUser,
    signIn,
    signUp,
    logout,
    error,
    isInitializing
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
