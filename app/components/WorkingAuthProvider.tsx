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
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Sync Kinde user with AuthUser state
  useEffect(() => {
    if (!isLoading) {
      // Kinde ha terminado de cargar
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
        console.log('ℹ️ [AUTH] Usuario no autenticado')
        setAuthUser(null)
      }
      
      // Marcar como listo inmediatamente cuando Kinde termina de cargar
      setIsReady(true)
    }
  }, [isLoading, isAuthenticated, kindeUser])

  // Timeout de seguridad: si Kinde no responde en 2 segundos, continuar de todos modos
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!isReady) {
        console.warn('⚠️ [AUTH] Timeout alcanzado, continuando sin autenticación')
        setIsReady(true)
      }
    }, 2000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isReady])

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

  // Mostrar loading solo mientras Kinde está cargando (y no ha pasado el timeout)
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  const contextValue = {
    user: authUser,
    authUser,
    loading: isLoading,
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