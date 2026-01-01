'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  const [forceRender, setForceRender] = useState(false)
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Timeout agresivo: 1 segundo para forzar renderizado
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      console.warn('⚠️ [AUTH] Forzando renderizado después de 1 segundo')
      setForceRender(true)
    }, 1000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Sync Clerk user with AuthUser state
  useEffect(() => {
    if (isLoaded) {
      // Limpiar timeout si Clerk cargó
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setForceRender(true)

      if (isSignedIn && clerkUser) {
        console.log('✅ [AUTH] Usuario autenticado:', clerkUser.primaryEmailAddress?.emailAddress)

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
        setAuthUser(null)
      }
    }
  }, [isLoaded, isSignedIn, clerkUser])

  const signIn = async (email: string, password: string) => {
    openSignIn({ redirectUrl: '/dashboard' })
  }

  const signUp = async (email: string, password: string) => {
    openSignUp({ redirectUrl: '/dashboard' })
  }

  const logout = async () => {
    await signOut(() => router.push('/'))
    setAuthUser(null)
  }

  // Renderizar después de 1 segundo O cuando Clerk cargue
  if (!forceRender) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  const contextValue = {
    user: authUser,
    authUser,
    loading: false,
    isAuthenticated: !!authUser,
    signIn,
    signUp,
    logout,
    error: null,
    isInitializing: false
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}