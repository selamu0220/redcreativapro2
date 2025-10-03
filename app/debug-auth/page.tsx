'use client'

import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'

export default function DebugAuth() {
  const { user, supabaseUser, isAuthenticated, isInitializing, loading, error } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [fetching, setFetching] = useState(false)

  const fetchDebugInfo = async () => {
    if (!user?.email) {
      console.log('🚨 No hay usuario autenticado')
      return
    }

    setFetching(true)
    try {
      console.log('🔍 Obteniendo información de debug...')
      const response = await fetch('/api/debug-user')
      const data = await response.json()
      console.log('📋 Datos de debug:', data)
      setDebugInfo(data)
    } catch (error) {
      console.error('❌ Error al obtener debug info:', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchDebugInfo()
    }
  }, [isAuthenticated, user?.email])

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug de Autenticación</h1>
        
        <div className="space-y-6">
          {/* Estado de autenticación */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Estado de Autenticación</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>isInitializing:</span>
                <span className={isInitializing ? 'text-yellow-400' : 'text-green-400'}>
                  {isInitializing ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>loading:</span>
                <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                  {loading ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>isAuthenticated:</span>
                <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {isAuthenticated ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>error:</span>
                <span className={error ? 'text-red-400' : 'text-green-400'}>
                  {error || 'Ninguno'}
                </span>
              </div>
            </div>
          </div>

          {/* Usuario de Auth */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Usuario de Auth (context.authUser)</h2>
            {user ? (
              <div className="space-y-2">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Display Name:</strong> {user.displayName || 'No establecido'}</div>
                <div><strong>Metadata:</strong> <pre className="text-sm bg-zinc-800 p-2 rounded mt-2">{JSON.stringify(user.user_metadata, null, 2)}</pre></div>
              </div>
            ) : (
              <div className="text-red-400">No hay usuario de auth disponible</div>
            )}
          </div>

          {/* Usuario de Supabase */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Usuario de Supabase (context.user)</h2>
            {supabaseUser ? (
              <div className="space-y-2">
                <div><strong>ID:</strong> {supabaseUser.id}</div>
                <div><strong>Email:</strong> {supabaseUser.email}</div>
                <div><strong>Created At:</strong> {supabaseUser.created_at}</div>
                <div><strong>Metadata:</strong> <pre className="text-sm bg-zinc-800 p-2 rounded mt-2">{JSON.stringify(supabaseUser.user_metadata, null, 2)}</pre></div>
              </div>
            ) : (
              <div className="text-red-400">No hay usuario de Supabase disponible</div>
            )}
          </div>

          {/* Información de debug */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información de Debug (API)</h2>
            {fetching ? (
              <div className="text-yellow-400">Cargando información de debug...</div>
            ) : debugInfo ? (
              <div className="space-y-2">
                {debugInfo.error ? (
                  <div className="text-red-400">
                    <strong>Error:</strong> {debugInfo.error}
                    {debugInfo.details && <div className="text-sm mt-1">{debugInfo.details}</div>}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Autenticado:</span>
                      <span className={debugInfo.authenticated ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.authenticated ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usuario local encontrado:</span>
                      <span className={debugInfo.localUserFound ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.localUserFound ? 'Sí' : 'No'}
                      </span>
                    </div>
                    {debugInfo.localUser && (
                      <div>
                        <strong>Usuario local:</strong>
                        <pre className="text-sm bg-zinc-800 p-2 rounded mt-2">{JSON.stringify(debugInfo.localUser, null, 2)}</pre>
                      </div>
                    )}
                    {debugInfo.supabaseUser && (
                      <div>
                        <strong>Usuario Supabase:</strong>
                        <pre className="text-sm bg-zinc-800 p-2 rounded mt-2">{JSON.stringify(debugInfo.supabaseUser, null, 2)}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-yellow-400">No hay información de debug disponible</div>
            )}
          </div>

          {/* Botón para reintentar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <button
              onClick={fetchDebugInfo}
              disabled={!user?.email || fetching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              {fetching ? '🔄 Cargando...' : '🔍 Actualizar Debug'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}