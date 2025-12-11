'use client'

import React, { useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface AuthProviderProps {
  children: React.ReactNode
}

export function UltraSimpleAuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  console.log('🚀 UltraSimpleAuthProvider: Renderizado directo sin inicialización')

  const signIn = async (email: string, password: string) => {
    setError('Función de login no implementada')
  }

  const signUp = async (email: string, password: string) => {
    setError('Función de registro no implementada')
  }

  const logout = async () => {
    router.push('/auth')
  }

  const contextValue = {
    user: null,
    authUser: null,
    loading,
    isAuthenticated: false,
    signIn,
    signUp,
    logout,
    error,
    isInitializing: false
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}