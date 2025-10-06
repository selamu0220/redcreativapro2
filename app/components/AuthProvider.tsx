'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext, AuthUser } from '../contexts/AuthContext'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { getUserByEmailAsync, createOrUpdateUserAsync } from '../lib/database'
import { handleAuthError, useAuthRetry } from '../lib/auth-error-handler'

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

  // Función para asegurar que el usuario esté registrado en la base de datos local
  const ensureUserInDatabase = async (supabaseUser: User) => {
    try {
      console.log('🔍 Verificando usuario en base de datos local:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
        hasEmail: !!supabaseUser.email
      })

      if (!supabaseUser.email) {
        console.warn('⚠️ Usuario sin email, no se puede registrar en la base de datos local')
        return
      }

      // Verificar si el usuario ya existe
      console.log('🔎 Buscando usuario por email:', supabaseUser.email)
      const existingUser = await getUserByEmailAsync(supabaseUser.email)
      console.log('📋 Resultado búsqueda:', existingUser ? 'Usuario encontrado' : 'Usuario no encontrado')
      
      if (!existingUser) {
        console.log('👤 Registrando nuevo usuario en la base de datos local:', supabaseUser.email)
        
        // Crear usuario con datos básicos
        const newUser = await createOrUpdateUserAsync({
          email: supabaseUser.email,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        })
        
        console.log('✅ Usuario registrado exitosamente en la base de datos local:', newUser)
      } else {
        console.log('ℹ️ Usuario ya existe en la base de datos local, actualizando lastActiveAt')
        
        // Actualizar lastActiveAt para usuarios existentes
        const updatedUser = await createOrUpdateUserAsync({
          email: supabaseUser.email,
          lastActiveAt: new Date().toISOString()
        })
        
        console.log('✅ Usuario actualizado:', updatedUser)
      }
    } catch (error) {
      console.error('❌ Error al registrar usuario en la base de datos local:', error)
      // No lanzamos el error para no interrumpir el flujo de autenticación
    }
  }

  // Hacer auth disponible globalmente para el hook useAuth
  useEffect(() => {
    if (supabase?.auth) {
      (window as any).supabaseAuth = supabase.auth
      console.log('🔐 Supabase auth guardado globalmente')
    }
  }, [])

  // Inicializar autenticación
  useEffect(() => {
    let subscription: any = null
    let initialCheckComplete = false

    const initializeAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación con Supabase...')

        // Verificar que Supabase esté configurado
        if (!supabase) {
          throw new Error('Supabase no está configurado. Verifica las variables de entorno.')
        }

        console.log('✅ Supabase cliente creado')

        // Configurar listener de cambios de autenticación ANTES de obtener la sesión
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔔 Evento de autenticación:', event)
            
            if (session?.user) {
              console.log('👤 Procesando usuario autenticado:', session.user.email)
              // Registrar usuario automáticamente en la base de datos local
              await ensureUserInDatabase(session.user)
              
              // Configurar cookie para el middleware
              if (session.access_token) {
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
                console.log('Cookie de autenticación configurada desde listener')
              }
              
              setUser(session.user)
              setAuthUser({
                id: session.user.id,
                email: session.user.email || '',
                user_metadata: session.user.user_metadata || {},
                uid: session.user.id, // For backward compatibility
                displayName: session.user.user_metadata?.name || session.user.user_metadata?.full_name || (session.user.email ? session.user.email.split('@')[0] : '') || ''
              })
              console.log('✅ Usuario autenticado y registrado:', session.user.email)
            } else {
              // Limpiar cookie cuando el usuario se desloguea
              document.cookie = 'sb-access-token=; path=/; max-age=0'
              console.log('Cookie de autenticación limpiada')
              setUser(null)
              setAuthUser(null)
            }
            
            // Solo marcar como no inicializando después del primer check
            if (initialCheckComplete) {
              setIsInitializing(false)
            }
            setLoading(false)
            setError('')
          }
        )

        subscription = authSubscription

        // Obtener la sesión actual DESPUÉS de configurar el listener
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Error al obtener sesión:', sessionError)
          throw sessionError
        }

        if (session?.user) {
          console.log('👤 Usuario autenticado encontrado:', session.user.email)
          
          // Registrar usuario automáticamente en la base de datos local
          await ensureUserInDatabase(session.user)
          
          // Configurar cookie para el middleware
          if (session.access_token) {
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
            console.log('Cookie de autenticación configurada desde sesión inicial')
          }
          
          setUser(session.user)
          setAuthUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata || {},
            uid: session.user.id, // For backward compatibility
            displayName: session.user.user_metadata?.name || session.user.user_metadata?.full_name || (session.user.email ? session.user.email.split('@')[0] : '') || ''
          })
          console.log('✅ Usuario autenticado establecido en inicialización:', session.user.email)
        } else {
          console.log('ℹ️ No hay usuario autenticado')
          // Limpiar cookie si no hay usuario
          document.cookie = 'sb-access-token=; path=/; max-age=0'
          setUser(null)
          setAuthUser(null)
        }

        // Marcar el check inicial como completo y finalizar inicialización
        initialCheckComplete = true
        setIsInitializing(false)
        console.log('✅ Inicialización de autenticación completada')

      } catch (err: any) {
        console.error('❌ Error al inicializar Supabase:', err)
        
        // Manejo mejorado de errores de inicialización
        let errorMessage = 'Error de inicialización';
        if (err.message?.includes('Failed to fetch')) {
          errorMessage = 'Error de conexión durante la inicialización. Verifica tu conexión a internet.';
        } else if (err.message?.includes('Network request failed')) {
          errorMessage = 'Error de red durante la inicialización. Intenta recargar la página.';
        } else if (err.message?.includes('timeout')) {
          errorMessage = 'Tiempo de espera agotado durante la inicialización. Intenta nuevamente.';
        } else if (err.message) {
          errorMessage = `Error de inicialización: ${err.message}`;
        }
        
        setError(errorMessage)
        setIsInitializing(false)
        
        // Intentar reconectar después de un error de red
        if (err.message?.includes('Failed to fetch') || err.message?.includes('Network request failed')) {
          console.log('🔄 Intentando reconectar en 5 segundos...');
          setTimeout(() => {
            console.log('🔄 Reintentando inicialización...');
            initializeAuth();
          }, 5000);
        }
      }
    }

    initializeAuth()

    // Función de limpieza
    return () => {
      if (subscription) {
        console.log('🧹 Limpiando listener de autenticación')
        subscription.unsubscribe()
      }
    }
  }, [])

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    const { retry } = useAuthRetry();
    
    try {
      setError('')
      setLoading(true)
      
      const result = await retry(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          throw error;
        }
        
        return data;
      });
      
      console.log('Sign in successful:', result.user?.email)
      
      // Configurar cookie para el middleware después del login exitoso
      if (result.session?.access_token) {
        document.cookie = `sb-access-token=${result.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        console.log('Cookie de autenticación configurada')
      }
      
      // No redirigir aquí, dejar que el componente maneje la redirección
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      // Usar el manejador centralizado de errores
      const authError = handleAuthError(error);
      setError(authError.userMessage);
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError('')
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        console.error('Supabase signup error:', error)
        
        // Provide more user-friendly error messages
        if (error.message.includes('User already registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.')
        } else if (error.message.includes('Password should be at least')) {
          setError('La contraseña debe tener al menos 6 caracteres.')
        } else if (error.message.includes('Failed to fetch')) {
          setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.')
        } else {
          setError(`Error de registro: ${error.message}`)
        }
        return
      }
      
      console.log('Sign up successful:', data.user?.email)
      // No redirigir aquí, dejar que el componente maneje la redirección
    } catch (error: any) {
      console.error('Unexpected error during sign up:', error)
      
      if (error.message.includes('Failed to fetch')) {
        setError('Error de conexión con el servidor. Verifica tu conexión a internet.')
      } else {
        setError(`Error inesperado: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return
      }
      
      // Limpiar cookie de autenticación
      document.cookie = 'sb-access-token=; path=/; max-age=0'
      console.log('Cookie de autenticación limpiada en logout')
      
      router.push('/auth')
    } catch (error: any) {
      setError(error.message)
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