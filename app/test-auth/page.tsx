'use client'

import { useAuth } from '../hooks/useAuth'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { useState } from 'react'

export default function TestAuthPage() {
  const { user, loading, error, signIn, signUp, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error de autenticación')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err: any) {
      setAuthError(err.message || 'Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba de Autenticación Supabase
          </h1>
          <p className="text-gray-600">
            Página de prueba para verificar la integración con Supabase
          </p>
        </div>

        {/* Estado de autenticación */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado Actual</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}
          
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-green-700 font-medium">Autenticado</span>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-sm text-gray-600 mb-1">Email:</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-sm text-gray-600 mb-1">ID:</p>
                <p className="font-mono text-xs break-all">{user.id}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                <span className="text-gray-600">No autenticado</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulario de autenticación */}
        {!user && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex mb-4">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
                  !isSignUp
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  isSignUp
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{authError}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Esta página es solo para pruebas de desarrollo</p>
          <p className="mt-1">
            <a href="/auth" className="text-blue-600 hover:text-blue-800">
              Ir a la página de autenticación principal
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}