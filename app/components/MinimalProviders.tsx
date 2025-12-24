'use client'

import React, { createContext, useContext, useState } from 'react'

// Contexto de autenticación mínimo
interface AuthUser {
  id: string
  email: string
  displayName?: string
  uid?: string
  created_at?: string
  user_metadata?: any
  fullName?: string
  firstName?: string
  primaryEmailAddress?: {
    emailAddress: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Provider mínimo que funciona sin Supabase
function MinimalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError('')
    
    try {
      // Simulación de login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email && password.length >= 6) {
        const mockUser: AuthUser = {
          id: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0]
        }
        setUser(mockUser)
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('minimal-auth-user', JSON.stringify(mockUser))
        }
      } else {
        setError('Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError('')
    
    try {
      // Simulación de registro
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email && password.length >= 6) {
        const mockUser: AuthUser = {
          id: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0]
        }
        setUser(mockUser)
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('minimal-auth-user', JSON.stringify(mockUser))
        }
      } else {
        setError('Email y contraseña requeridos (mín. 6 caracteres)')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('minimal-auth-user')
    }
  }

  // Verificar sesión guardada al inicializar
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('minimal-auth-user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem('minimal-auth-user')
        }
      }
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    logout,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Contexto de idioma mínimo
const LanguageContext = createContext<{
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}>({
  language: 'es',
  setLanguage: () => {},
  t: (key: string) => key
})

function MinimalLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('es')
  
  const t = (key: string) => {
    // Traducciones básicas
    const translations: Record<string, string> = {
      'auth.login': 'Iniciar Sesión',
      'auth.register': 'Registrarse',
      'auth.email': 'Email',
      'auth.password': 'Contraseña',
      'auth.logout': 'Cerrar Sesión',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'dashboard.title': 'Panel de Control'
    }
    
    return translations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Provider principal que combina todo
export default function MinimalProviders({ children }: { children: React.ReactNode }) {
  return (
    <MinimalLanguageProvider>
      <MinimalAuthProvider>
        {children}
      </MinimalAuthProvider>
    </MinimalLanguageProvider>
  )
}

// Hooks de conveniencia
export const useAuth = () => useAuthContext()
export const useLanguage = () => useContext(LanguageContext)
