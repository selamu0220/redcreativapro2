'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { LoginLink, RegisterLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'

interface AuthProviderProps {
  children: React.ReactNode
}

export function WorkingAuthProvider({ children }: AuthProviderProps) {
  const { user: kindeUser, isLoading, isAuthenticated } = useKindeBrowserClient()
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

  // Sync Kinde user with AuthUser state
  useEffect(() => {
    if (!isLoading) {
      // Limpiar timeout si Kinde cargó
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setForceRender(true)

      if (isAuthenticated && kindeUser) {
        console.log('✅ [AUTH] Usuario autenticado:', kindeUser.email)

        const convertedUser: AuthUser = {
          id: kindeUser.id,
          uid: kindeUser.id,
          email: kindeUser.email || '',
          displayName: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email || '',
          user_metadata: {
            full_name: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim(),
            avatar_url: kindeUser.picture
          },
          created_at: new Date().toISOString()
        }

        setAuthUser(convertedUser)
      } else {
        setAuthUser(null)
      }
    }
  }, [isLoading, isAuthenticated, kindeUser])

  const signIn = async (email: string, password: string) => {
    // Kinde handles this via LoginLink component
    router.push('/api/auth/login?post_login_redirect_url=/dashboard')
  }

  const signUp = async (email: string, password: string) => {
    // Kinde handles this via RegisterLink component
    router.push('/api/auth/register?post_login_redirect_url=/dashboard')
  }

  const logout = async () => {
    router.push('/api/auth/logout')
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