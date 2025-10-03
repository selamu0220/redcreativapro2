'use client'

import { useState, useEffect } from 'react'

export default function AuthDebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth-status')
      const data = await response.json()
      
      setAuthStatus(data)
      console.log('Estado de autenticación:', data)
      
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      console.error('Error al verificar autenticación:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticación</h1>
        
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado Actual</h2>
          
          {loading && (
            <div className="text-zinc-400">Cargando...</div>
          )}
          
          {error && (
            <div className="bg-red-900 border border-red-700 rounded p-4 mb-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}
          
          {authStatus && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Autenticado:</span>
                <span className={authStatus.authenticated ? 'text-green-400' : 'text-red-400'}>
                  {authStatus.authenticated ? 'Sí' : 'No'}
                </span>
              </div>
              
              {authStatus.user && (
                <div className="bg-zinc-700 rounded p-4 space-y-2">
                  <h3 className="font-semibold mb-2">Información del Usuario:</h3>
                  <p><span className="font-medium">ID:</span> {authStatus.user.id}</p>
                  <p><span className="font-medium">Email:</span> {authStatus.user.email}</p>
                  <p><span className="font-medium">Email Verificado:</span> {authStatus.user.emailVerified || 'No verificado'}</p>
                  <p><span className="font-medium">Creado:</span> {authStatus.user.createdAt}</p>
                </div>
              )}
              
              {authStatus.message && (
                <div className="bg-blue-900 border border-blue-700 rounded p-4">
                  <p className="text-blue-200">{authStatus.message}</p>
                </div>
              )}
              
              {authStatus.error && (
                <div className="bg-yellow-900 border border-yellow-700 rounded p-4">
                  <p className="text-yellow-200">Error: {authStatus.error}</p>
                  {authStatus.details && (
                    <p className="text-yellow-300 text-sm mt-1">Detalles: {authStatus.details}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={checkAuthStatus}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Recargar Estado
          </button>
          
          <a
            href="/"
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
        
        <div className="mt-8 bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones:</h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-300">
            <li>Si no estás autenticado, por favor inicia sesión primero</li>
            <li>Si estás autenticado pero sin email, eso podría ser el problema</li>
            <li>El email debe estar verificado para el registro automático</li>
            <li>Si hay errores, revisa la consola del navegador para más detalles</li>
          </ol>
        </div>
      </div>
    </div>
  )
}