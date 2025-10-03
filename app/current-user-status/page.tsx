'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getUserByEmailAsync } from '../lib/database'

export default function CurrentUserStatus() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [localUser, setLocalUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    try {
      setLoading(true)
      
      // Obtener el usuario actual de Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Error de sesión: ${sessionError.message}`)
        return
      }

      if (!session?.user) {
        setError('No hay usuario autenticado')
        return
      }

      const user = session.user
      setCurrentUser({
        id: user.id,
        email: user.email,
        hasEmail: !!user.email,
        createdAt: user.created_at,
        userMetadata: user.user_metadata || {}
      })

      // Verificar si existe en la base de datos local
      if (user.email) {
        const localDbUser = await getUserByEmailAsync(user.email)
        setLocalUser(localDbUser)
      } else {
        setLocalUser(null)
      }

    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.reload()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  const handleManualRegistration = async () => {
    if (!currentUser?.email) {
      setError('No se puede registrar: el usuario no tiene email')
      return
    }

    try {
      const response = await fetch('/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          subscriptionStatus: 'free'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Volver a verificar el usuario
        const localDbUser = await getUserByEmailAsync(currentUser.email)
        setLocalUser(localDbUser)
        setError('Usuario registrado exitosamente')
      } else {
        setError(`Error al registrar: ${data.error}`)
      }
    } catch (err: any) {
      setError(`Error al registrar: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Verificando usuario...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Estado del Usuario Actual</h1>
          
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {currentUser ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Usuario de Supabase</h2>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {currentUser.id}</p>
                  <p><strong>Email:</strong> {currentUser.email || 'SIN EMAIL'}</p>
                  <p><strong>Tiene Email:</strong> {currentUser.hasEmail ? 'Sí' : 'No'}</p>
                  <p><strong>Creado:</strong> {new Date(currentUser.createdAt).toLocaleString()}</p>
                  <div>
                    <strong>Metadata:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(currentUser.userMetadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Usuario en Base de Datos Local</h2>
                {localUser ? (
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {localUser.email}</p>
                    <p><strong>Estado de Suscripción:</strong> {localUser.subscriptionStatus}</p>
                    <p><strong>Última Actividad:</strong> {new Date(localUser.lastActiveAt).toLocaleString()}</p>
                    <p><strong>Creado:</strong> {new Date(localUser.createdAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 mb-3">❌ Usuario NO encontrado en base de datos local</p>
                    {currentUser.hasEmail && (
                      <button
                        onClick={handleManualRegistration}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Registrar Manualmente
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={checkCurrentUser}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Recargar
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600 mb-4">No hay usuario autenticado</p>
              <a href="/login" className="text-blue-500 hover:underline">
                Ir a Iniciar Sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}