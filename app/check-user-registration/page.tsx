'use client'

import { useEffect, useState } from 'react'

interface UserStatus {
  success?: boolean
  error?: string
  user?: {
    id: string
    email: string
    hasEmail: boolean
    localUser?: any
    wasRegistered?: boolean
  }
  message?: string
  registrationError?: string
}

export default function CheckAndRegisterUser() {
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/check-and-register-user')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        error: 'Error al conectar con el servidor',
        message: 'No se pudo verificar el estado del usuario'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    checkUserStatus()
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Verificación de Usuario</h1>
            <button
              onClick={handleRetry}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Recargar
            </button>
          </div>

          {status?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-700 mb-2">{status.error}</p>
              {status.message && (
                <p className="text-red-600 text-sm">{status.message}</p>
              )}
              {status.registrationError && (
                <div className="mt-3 p-3 bg-red-100 rounded">
                  <p className="text-red-700 text-sm">
                    <strong>Error de registro:</strong> {status.registrationError}
                  </p>
                </div>
              )}
            </div>
          ) : status?.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Usuario Verificado</h2>
                <p className="text-green-700 mb-3">{status.message}</p>
                
                {status.user && (
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {status.user.id}</p>
                    <p><strong>Email:</strong> {status.user.email}</p>
                    <p><strong>Tiene Email:</strong> {status.user.hasEmail ? 'Sí' : 'No'}</p>
                    
                    {status.user.wasRegistered && (
                      <p className="text-blue-600 font-medium">ℹ️ Usuario registrado automáticamente</p>
                    )}
                    
                    {status.user.localUser && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <h3 className="font-semibold text-blue-800 mb-2">Datos en Base de Datos Local:</h3>
                        <p><strong>Email:</strong> {status.user.localUser.email}</p>
                        <p><strong>Estado:</strong> {status.user.localUser.subscriptionStatus}</p>
                        <p><strong>Última actividad:</strong> {new Date(status.user.localUser.lastActiveAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Próximos pasos:</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Si el usuario se registró correctamente, puedes volver al dashboard</li>
                  <li>• Si hay algún error, revisa los logs del servidor</li>
                  <li>• Asegúrate de que el usuario tenga un email válido en Supabase</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700">No se pudo obtener información del usuario</p>
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <a
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Volver al Inicio
            </a>
            <a
              href="/dashboard"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Ir al Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
