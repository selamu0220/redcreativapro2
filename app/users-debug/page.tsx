'use client'

import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'

export default function UsersDebugPage() {
  const [usersData, setUsersData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsersData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/all-users')
      const data = await response.json()
      
      if (response.ok) {
        setUsersData(data)
        console.log('Datos de usuarios:', data)
      } else {
        setError(`Error: ${data.error}`)
      }
      
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      console.error('Error al obtener usuarios:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersData()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Usuarios</h1>
        
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumen</h2>
          
          {loading && (
            <div className="text-zinc-400">Cargando...</div>
          )}
          
          {error && (
            <div className="bg-red-900 border border-red-700 rounded p-4 mb-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}
          
          {usersData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-700 rounded p-4">
                  <h3 className="font-semibold text-green-400 mb-2">Base de Datos Local</h3>
                  <p className="text-2xl font-bold">{usersData.localDatabase.count}</p>
                  <p className="text-sm text-zinc-400">usuarios registrados</p>
                </div>
                
                <div className="bg-zinc-700 rounded p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">Supabase Auth</h3>
                  <p className="text-2xl font-bold">{usersData.supabase.count}</p>
                  <p className="text-sm text-zinc-400">usuarios totales</p>
                </div>
                
                <div className="bg-zinc-700 rounded p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">Sesión Actual</h3>
                  <p className="text-2xl font-bold">{usersData.currentSession ? 'Activa' : 'Inactiva'}</p>
                  <p className="text-sm text-zinc-400">estado de sesión</p>
                </div>
              </div>
              
              {usersData.currentSession && (
                <div className="bg-blue-900 border border-blue-700 rounded p-4">
                  <h3 className="font-semibold mb-2">Usuario Actual:</h3>
                  <p><span className="font-medium">Email:</span> {usersData.currentSession.user.email}</p>
                  <p><span className="font-medium">ID:</span> {usersData.currentSession.user.id}</p>
                  <p><span className="font-medium">Verificado:</span> {usersData.currentSession.user.emailVerified || 'No verificado'}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {usersData && usersData.localDatabase.users.length > 0 && (
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Usuarios en Base de Datos Local</h2>
            <div className="space-y-2">
              {usersData.localDatabase.users.map((user: any) => (
                <div key={user.id} className="bg-zinc-700 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-zinc-400">ID: {user.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Estado: {user.subscriptionStatus}</p>
                    <p className="text-sm text-zinc-400">Tokens: {user.tokensUsed}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button
            onClick={fetchUsersData}
          >
            Recargar Datos
          </Button>
          
          <a
            href="/auth-debug"
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
          >
            Ver Estado Auth
          </a>
          
          <a
            href="/"
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}