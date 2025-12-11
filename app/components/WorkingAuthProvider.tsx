'use client'

import React, { useState, useEffect } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '../lib/supabase-client'
import { deploymentConfig } from '../lib/deployment-config'

interface AuthProviderProps {
  children: React.ReactNode
}

export function WorkingAuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()

  // Función para convertir User de Supabase a AuthUser
  const convertToAuthUser = (user: any): AuthUser => ({
    id: user.id,
    email: user.email || '',
    uid: user.id,
    user_metadata: user.user_metadata,
    displayName: user.user_metadata?.full_name || user.email || ''
  })

  // Inicialización con fallback
  useEffect(() => {
    console.log('🚀 WorkingAuthProvider: Inicialización')
    
    // Check deployment configuration
    if (deploymentConfig.supabase.fallbackMode) {
      console.log('📱 Modo fallback activado - Supabase no configurado')
    }
    
    // Timeout de seguridad para evitar carga infinita
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout de inicialización alcanzado')
      setIsInitializing(false)
    }, 2000)

    const initializeAuth = async () => {
      try {
        if (supabaseClient && deploymentConfig.supabase.enabled) {
          console.log('🔗 Usando Supabase para autenticación')
          
          // Obtener sesión actual
          const { data: { session }, error } = await supabaseClient.auth.getSession()
          
          if (error) {
            console.error('❌ Error obteniendo sesión:', error)
            // Limpiar tokens corruptos
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
              sessionStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
            }
          } else if (session?.user) {
            console.log('✅ Sesión de Supabase encontrada:', session.user.email)
            setUser(session.user)
            setAuthUser(convertToAuthUser(session.user))
          }
        } else {
          console.log('📱 Usando autenticación local (Supabase no configurado)')
          
          // Verificar sesión local como fallback
          if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('local-auth-user')
            if (savedUser) {
              try {
                const userData = JSON.parse(savedUser)
                setAuthUser(userData)
                console.log('✅ Sesión local encontrada:', userData.email)
              } catch (e) {
                console.warn('⚠️ Error parseando sesión local:', e)
                localStorage.removeItem('local-auth-user')
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error en inicialización:', error)
      } finally {
        clearTimeout(timeout)
        setIsInitializing(false)
      }
    }

    initializeAuth()

    // Configurar listener de Supabase solo si está disponible
    let subscription: any = null
    if (supabaseClient) {
      const { data } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          console.log('📡 Auth state changed:', event)
          
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
      subscription = data
    }

    return () => {
      clearTimeout(timeout)
      if (subscription) {
        // Supabase v2 usa subscription.subscription.unsubscribe()
        if (typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe()
        } else if (subscription.subscription && typeof subscription.subscription.unsubscribe === 'function') {
          subscription.subscription.unsubscribe()
        }
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      console.log('🔐 Intentando login para:', email)
      
      if (supabaseClient) {
        // Usar Supabase si está disponible
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          console.error('❌ Error de login:', error)
          let errorMessage = 'Error al iniciar sesión'
          
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Credenciales inválidas'
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Por favor confirma tu email'
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Demasiados intentos. Espera un momento.'
          }
          
          setError(errorMessage)
        } else if (data.user) {
          console.log('✅ Login exitoso con Supabase:', data.user.email)
          setUser(data.user)
          setAuthUser(convertToAuthUser(data.user))
        }
      } else {
        // Fallback: autenticación local simple
        console.log('📱 Usando autenticación local para:', email)
        
        // Validaciones básicas
        if (!email || !password) {
          setError('Email y contraseña son requeridos')
          return
        }
        
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres')
          return
        }
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Crear usuario local
        const localUser: AuthUser = {
          id: `local-${Date.now()}`,
          email,
          uid: `local-${Date.now()}`,
          displayName: email.split('@')[0],
          user_metadata: { full_name: email.split('@')[0] }
        }
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('local-auth-user', JSON.stringify(localUser))
        }
        
        setAuthUser(localUser)
        console.log('✅ Login exitoso con autenticación local:', email)
      }
    } catch (error: any) {
      console.error('❌ Error de conexión en login:', error)
      setError('Error de conexión. Verifica tu internet.')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      console.log('📝 Intentando registro para:', email)
      
      if (supabaseClient) {
        // Usar Supabase si está disponible
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password
        })
        
        if (error) {
          console.error('❌ Error de registro:', error)
          let errorMessage = 'Error al crear cuenta'
          
          if (error.message.includes('User already registered')) {
            errorMessage = 'El usuario ya está registrado'
          } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres'
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Email inválido'
          }
          
          setError(errorMessage)
        } else if (data.user) {
          console.log('✅ Registro exitoso con Supabase:', data.user.email)
          setUser(data.user)
          setAuthUser(convertToAuthUser(data.user))
        }
      } else {
        // Fallback: registro local simple
        console.log('📱 Usando registro local para:', email)
        
        // Validaciones básicas
        if (!email || !password) {
          setError('Email y contraseña son requeridos')
          return
        }
        
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres')
          return
        }
        
        // Verificar si el usuario ya existe localmente
        if (typeof window !== 'undefined') {
          const existingUsers = localStorage.getItem('local-registered-users')
          if (existingUsers) {
            const users = JSON.parse(existingUsers)
            if (users.includes(email)) {
              setError('El usuario ya está registrado')
              return
            }
          }
        }
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Crear usuario local
        const localUser: AuthUser = {
          id: `local-${Date.now()}`,
          email,
          uid: `local-${Date.now()}`,
          displayName: email.split('@')[0],
          user_metadata: { full_name: email.split('@')[0] }
        }
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('local-auth-user', JSON.stringify(localUser))
          
          // Mantener registro de usuarios registrados
          const existingUsers = localStorage.getItem('local-registered-users')
          const users = existingUsers ? JSON.parse(existingUsers) : []
          users.push(email)
          localStorage.setItem('local-registered-users', JSON.stringify(users))
        }
        
        setAuthUser(localUser)
        console.log('✅ Registro exitoso con autenticación local:', email)
      }
    } catch (error: any) {
      console.error('❌ Error de conexión en registro:', error)
      setError('Error de conexión. Verifica tu internet.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut()
        if (error) {
          console.warn('⚠️ Warning en logout:', error)
        }
      }
      
      // Limpiar estado local
      setUser(null)
      setAuthUser(null)
      
      // Limpiar localStorage (tanto Supabase como local)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
        sessionStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token')
        localStorage.removeItem('auth-user')
        localStorage.removeItem('local-auth-user') // Limpiar sesión local también
      }
      
      console.log('✅ Logout exitoso')
      router.push('/auth')
    } catch (error: any) {
      console.error('❌ Error de logout:', error)
      // Limpiar estado de todos modos
      setUser(null)
      setAuthUser(null)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  // Renderizado con timeout de seguridad
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <p className="text-zinc-400 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  const contextValue = {
    user,
    authUser,
    loading,
    isAuthenticated: !!authUser,
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