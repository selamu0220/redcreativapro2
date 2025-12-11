'use client'

import { useEffect, useState } from 'react'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { authService } from '../lib/auth/AuthenticationService'
import { sessionManager } from '../lib/auth/SessionManager'
import { diagnosticService } from '../lib/auth/DiagnosticService'
import { getUserByEmailAsync, createOrUpdateUserAsync } from '../lib/database'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  
  // Comentando temporalmente el hook useAuthRetry
  // const { retry } = useAuthRetry()

  // Función para asegurar que el usuario esté registrado en la base de datos local
  const ensureUserInDatabase = async (authUser: AuthUser) => {
    try {
      console.log('🔍 Verificando usuario en base de datos local:', {
        id: authUser.id,
        email: authUser.email,
        hasEmail: !!authUser.email
      })

      if (!authUser.email) {
        console.warn('⚠️ Usuario sin email, no se puede registrar en la base de datos local')
        return
      }

      // Verificar si el usuario ya existe
      console.log('🔎 Buscando usuario por email:', authUser.email)
      const existingUser = await getUserByEmailAsync(authUser.email)
      console.log('📋 Resultado búsqueda:', existingUser ? 'Usuario encontrado' : 'Usuario no encontrado')
      
      if (!existingUser) {
        console.log('👤 Registrando nuevo usuario en la base de datos local:', authUser.email)
        
        // Crear usuario con datos básicos
        const newUser = await createOrUpdateUserAsync({
          email: authUser.email,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        })
        
        console.log('✅ Usuario registrado exitosamente en la base de datos local:', newUser)
      } else {
        console.log('ℹ️ Usuario ya existe en la base de datos local, actualizando lastActiveAt')
        
        // Actualizar lastActiveAt para usuarios existentes
        const updatedUser = await createOrUpdateUserAsync({
          email: authUser.email,
          lastActiveAt: new Date().toISOString()
        })
        
        console.log('✅ Usuario actualizado:', updatedUser)
      }
    } catch (error) {
      console.error('❌ Error al registrar usuario en la base de datos local:', error)
      // No lanzamos el error para no interrumpir el flujo de autenticación
    }
  }

  // Inicializar autenticación con el nuevo servicio
  useEffect(() => {
    console.log('🚀 Initializing authentication with new service...')
    
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Initialize session manager
        const sessionResult = await sessionManager.initialize()
        
        if (sessionResult.valid && sessionResult.user) {
          console.log('👤 Found valid session:', sessionResult.user.email)
          setAuthUser(sessionResult.user)
          setUser(sessionResult.session?.user || null)
          
          // Ensure user is in local database
          await ensureUserInDatabase(sessionResult.user)
        } else {
          console.log('👤 No valid session found')
          setAuthUser(null)
          setUser(null)
        }

        // Set up session state listener
        const unsubscribe = sessionManager.addListener((sessionState) => {
          console.log('📡 Session state changed:', sessionState.isValid)
          setAuthUser(sessionState.user)
          setUser(sessionState.session?.user || null)
          
          if (sessionState.user) {
            ensureUserInDatabase(sessionState.user).catch(console.error)
          }
        })

        // Start periodic health checks
        diagnosticService.startPeriodicHealthChecks()

        // Cleanup function
        return unsubscribe
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setError('Error al inicializar la autenticación')
      } finally {
        setIsInitializing(false)
        setLoading(false)
      }
    }

    const cleanup = initializeAuth()
    
    return () => {
      cleanup.then(unsubscribe => {
        if (unsubscribe) unsubscribe()
      })
      diagnosticService.stopPeriodicHealthChecks()
    }
  }, [])

  // Authentication methods using new service
  const signIn = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      const result = await authService.signIn(email, password)
      
      if (result.success && result.user) {
        console.log('Sign in successful:', result.user.email)
        
        // Update local state
        setAuthUser(result.user)
        setUser(result.session?.user || null)
        
        // Ensure user is in local database
        await ensureUserInDatabase(result.user)
      } else if (result.error) {
        setError(result.error.userMessage)
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError('Error de autenticación. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      const result = await authService.signUp(email, password)
      
      if (result.success && result.user) {
        console.log('Sign up successful:', result.user.email)
        
        // Update local state
        setAuthUser(result.user)
        setUser(result.session?.user || null)
        
        // Ensure user is in local database
        await ensureUserInDatabase(result.user)
      } else if (result.error) {
        setError(result.error.userMessage)
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError('Error de registro. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      const result = await authService.signOut()
      
      // Clear local state regardless of result
      setUser(null)
      setAuthUser(null)
      
      // Clean up session manager
      await sessionManager.cleanup()
      
      if (result.error) {
        console.warn('Logout warning:', result.error.message)
        // Don't show error to user for logout, just log it
      }
      
      console.log('Logout completed')
      router.push('/auth')
    } catch (error: any) {
      console.error('Logout error:', error)
      // Still clear local state and redirect even if logout fails
      setUser(null)
      setAuthUser(null)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  // Renderizado condicional después de todos los hooks
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Inicializando autenticación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error de Autenticación</h2>
            <p className="text-red-300">{error}</p>
          </div>
          <button 
            type="button"
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Reintentar
          </button>
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