'use client'

import { useEffect, useState } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthProviderProps {
  children: React.ReactNode
}

export function MinimalAuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // Inicialización ultra-rápida con timeout forzado
  useEffect(() => {
    console.log('⚡ Inicialización mínima de autenticación...')
    
    // Timeout forzado de 2 segundos máximo
    const forceTimeout = setTimeout(() => {
      console.log('⏰ Timeout forzado - continuando sin autenticación')
      setIsInitializing(false)
      setUser(null)
      setAuthUser(null)
    }, 2000)

    // Intentar inicialización rápida
    const quickInit = async () => {
      try {
        // Verificar si hay variables de entorno
        const hasSupabaseConfig = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        if (!hasSupabaseConfig) {
          console.log('ℹ️ No hay configuración de Supabase - modo offline')
          clearTimeout(forceTimeout)
          setIsInitializing(false)
          return
        }

        // Importación dinámica para evitar bloqueos
        const { supabaseClient } = await import('../lib/supabase-client')
        
        if (!supabaseClient) {
          console.log('ℹ️ Cliente de Supabase no disponible - modo offline')
          clearTimeout(forceTimeout)
          setIsInitializing(false)
          return
        }

        // Verificación rápida de sesión con timeout corto
        const sessionPromise = supabaseClient.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        clearTimeout(forceTimeout)

        if (error) {
          console.warn('⚠️ Error de sesión:', error.message)
          // Limpiar tokens corruptos
          if (typeof window !== 'undefined') {
            localStorage.clear()
          }
        } else if (session?.user) {
          console.log('✅ Sesión encontrada:', session.user.email)
          setUser(session.user)
          setAuthUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata || {},
            uid: session.user.id,
            displayName: session.user.email?.split('@')[0] || ''
          })
        }

      } catch (error: any) {
        console.warn('⚠️ Error en inicialización rápida:', error.message)
        clearTimeout(forceTimeout)
      } finally {
        setIsInitializing(false)
      }
    }

    quickInit()

    // Cleanup
    return () => {
      clearTimeout(forceTimeout)
    }
  }, [])

  // Métodos de autenticación básicos
  const signIn = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
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

  // Renderizado inmediato sin bloqueos
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <p className="text-zinc-400 text-sm">Inicializando...</p>
        </div>
      </div>
    )
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
    isInitializing
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}