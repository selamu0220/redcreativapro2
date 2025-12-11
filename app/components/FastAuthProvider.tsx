'use client'

import { useState } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthProviderProps {
  children: React.ReactNode
}

export function FastAuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // NO HAY INICIALIZACIÓN - Directamente renderizamos
  console.log('⚡ FastAuthProvider: Sin inicialización, renderizado directo')

  const signIn = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      // Importación dinámica solo cuando se necesita
      const { supabaseClient } = await import('../lib/supabase-client')
      
      if (!supabaseClient) {
        setError('Servicio de autenticación no disponible')
        return
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setError(error.message)
      } else if (data.user) {
        setUser(data.user)
        setAuthUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata || {},
          uid: data.user.id,
          displayName: data.user.email?.split('@')[0] || ''
        })
      }
    } catch (error: any) {
      console.error('Error de login:', error)
      setError('Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      const { supabaseClient } = await import('../lib/supabase-client')
      
      if (!supabaseClient) {
        setError('Servicio de autenticación no disponible')
        return
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
      })
      
      if (error) {
        setError(error.message)
      } else if (data.user) {
        setUser(data.user)
        setAuthUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata || {},
          uid: data.user.id,
          displayName: data.user.email?.split('@')[0] || ''
        })
      }
    } catch (error: any) {
      console.error('Error de registro:', error)
      setError('Error de registro')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      const { supabaseClient } = await import('../lib/supabase-client')
      
      if (supabaseClient) {
        await supabaseClient.auth.signOut()
      }
      
      setUser(null)
      setAuthUser(null)
      
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }
      
      router.push('/auth')
    } catch (error: any) {
      console.error('Error de logout:', error)
      setUser(null)
      setAuthUser(null)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const contextValue = {
    user,
    authUser,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    logout,
    error,
    isInitializing: false // SIEMPRE false para evitar pantalla de carga
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}