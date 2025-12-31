'use client'

import React, { useState, useEffect } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'

interface AuthProviderProps {
  children: React.ReactNode
}

export function WorkingAuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { signOut, openSignIn, openSignUp } = useClerk()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()

  // Sync Clerk user with AuthUser state
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        console.log('✅ [AUTH] Usuario de Clerk detectado:', clerkUser.primaryEmailAddress?.emailAddress)

        const convertedUser: AuthUser = {
          id: clerkUser.id,
          uid: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          displayName: clerkUser.fullName || clerkUser.firstName || '',
          user_metadata: {
            full_name: clerkUser.fullName,
            avatar_url: clerkUser.imageUrl
          },
          created_at: clerkUser.createdAt?.toISOString()
        }

        setAuthUser(convertedUser)
      } else {
        console.log('👤 [AUTH] No hay usuario autenticado')
        setAuthUser(null)
      }
      setIsInitializing(false)
    }
  }, [isLoaded, isSignedIn, clerkUser])

  // Adapter functions for legacy sign-in/sign-up calls
  // These will now redirect to Clerk's managed UI
  const signIn = async (email: string, password: string) => {
    console.log('Redirecting to Clerk Sign In...')
    openSignIn({ redirectUrl: '/dashboard' })
  }

  const signUp = async (email: string, password: string) => {
    console.log('Redirecting to Clerk Sign Up...')
    openSignUp({ redirectUrl: '/dashboard' })
  }

  const logout = async () => {
    console.log('Logging out via Clerk...')
    await signOut(() => router.push('/'))
    setAuthUser(null)
  }

  // Show loading spinner ONLY if Clerk hasn't even finished checking for a session
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <p className="text-zinc-400 text-sm">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  const contextValue = {
    user: authUser, // Map authUser to user legacy prop
    authUser,
    loading: !isLoaded,
    isAuthenticated: !!authUser,
    signIn,
    signUp,
    logout,
    error: null, // Clerk handles UI errors
    isInitializing: !isLoaded
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}