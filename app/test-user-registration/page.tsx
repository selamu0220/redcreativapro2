'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function TestUserRegistration() {
  const { user, isLoading: authLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const checkUserStatus = async () => {
    if (!user?.email) {
      setMessage('No hay usuario autenticado')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Verificar autenticación
      const authResponse = await fetch('/api/check-auth')
      const authData = await authResponse.json()
      console.log('🔐 Estado de autenticación:', authData)

      // Verificar el estado del usuario en la BD
      const debugResponse = await fetch('/api/debug-user')
      const debugData = await debugResponse.json()
      console.log('📋 Datos debug del usuario:', debugData)
      setDebugInfo(debugData)

      if (debugData.userFound) {
        setMessage('✅ Usuario encontrado en la base de datos')
      } else {
        setMessage('❌ Usuario no encontrado en la base de datos')
      }
    } catch (error) {
      console.error('❌ Error al verificar usuario:', error)
      setMessage('Error al verificar usuario')
    } finally {
      setLoading(false)
    }
  }

  const registerUser = async () => {
    if (!user?.email) {
      setMessage('No hay usuario autenticado')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          subscriptionStatus: 'free'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Usuario registrado exitosamente')
        // Verificar de nuevo
        await checkUserStatus()
      } else {
        setMessage(`❌ Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (error) {
      setMessage(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email && !authLoading) {
      checkUserStatus()
    }
  }, [user?.email, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Registro de Usuario</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Registro de Usuario</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">No autenticado</h2>
            <p className="text-red-600">Por favor, inicia sesión para probar el registro de usuarios.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Registro de Usuario</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Usuario</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email || 'No disponible'}</p>
            <p><span className="font-medium">ID:</span> {user.id || 'No disponible'}</p>
            <p><span className="font-medium">Estado de suscripción:</span> {(user as any).subscriptionStatus || 'No disponible'}</p>
          </div>
        </div>

        {debugInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado en Base de Datos</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Autenticado:</span> {debugInfo.authenticated ? 'Sí' : 'No'}</p>
              <p><span className="font-medium">Email en BD:</span> {debugInfo.email || 'No disponible'}</p>
              <p><span className="font-medium">Usuario encontrado:</span> {debugInfo.userFound ? 'Sí' : 'No'}</p>
              {debugInfo.userCreated && <p className="text-green-600">✅ Usuario creado automáticamente</p>}
              {debugInfo.error && <p className="text-red-600">❌ Error: {debugInfo.error}</p>}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={checkUserStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verificando...' : '🔍 Verificar Estado'}
            </button>
            
            {debugInfo && !debugInfo.userFound && (
              <button
                onClick={registerUser}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registrando...' : '📝 Registrar Usuario'}
              </button>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
