'use client'

import { useEffect, useState } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '../lib/supabase-client'

interface SimpleAuthProviderProps {
  children: React.ReactNode
}

export function SimpleAuthProvider({ children }: SimpleAuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // Función para convertir User de Supabase a AuthUser
  const convertToAuthUser = (user: User): AuthUser => ({
    id: user.id,
    email: user.email || '',
    uid: user.id,
    user_metadata: user.user_metadata,
    displayName: user.user_metadata?.full_name || user.email || ''
  })

  // Inicializar autenticación
  useEffect(() => {
    if (!supabaseClient) {
      console.warn('Supabase client not available')
      setIsInitializing(false)
      return
    }

    const initializeAuth = async () => {
      try {
        // Obtener sesión actual
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // Limpiar tokens corruptos
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
            sessionStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
          }
        } else if (session?.user) {
          setUser(session.user)
          setAuthUser(convertToAuthUser(session.user))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          setUser(session.user)
          setAuthUser(convertToAuthUser(session.user))
        } else {
          setUser(null)
          setAuthUser(null)
        }
        
        setError('')
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabaseClient) {
      setError('Servicio de autenticación no disponible')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Sign in error:', error)
        setError(error.message === 'Invalid login credentials' 
          ? 'Credenciales inválidas' 
          : 'Error al iniciar sesión')
      } else if (data.user) {
        setUser(data.user)
        setAuthUser(convertToAuthUser(data.user))
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabaseClient) {
      setError('Servicio de autenticación no disponible')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
      })
      
      if (error) {
        console.error('Sign up error:', error)
        setError(error.message === 'User already registered' 
          ? 'El usuario ya está registrado' 
          : 'Error al crear cuenta')
      } else if (data.user) {
        setUser(data.user)
        setAuthUser(convertToAuthUser(data.user))
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (!supabaseClient) {
      setUser(null)
      setAuthUser(null)
      router.push('/auth')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabaseClient.auth.signOut()
      
      if (error) {
        console.warn('Logout warning:', error)
      }
      
      // Limpiar estado local
      setUser(null)
      setAuthUser(null)
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
        sessionStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
      }
      
      router.push('/auth')
    } catch (error: any) {
      console.error('Logout error:', error)
      // Limpiar estado de todos modos
      setUser(null)
      setAuthUser(null)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  // Renderizado condicional
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Inicializando...</p>
        </div>
      </div>
    )
  }

  const contextValue = {
    user,
    authUser,
    loading,
    isAuthenticated: !!user && !!authUser,
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