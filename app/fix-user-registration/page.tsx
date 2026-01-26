'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function FixUserRegistration() {
  const { user, isLoading: authLoading } = useAuth()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userInDb, setUserInDb] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const checkCurrentUser = async () => {
    try {
      const response = await fetch('/api/current-user')
      const data = await response.json()
      
      if (response.ok) {
        setCurrentUser(data.user)
        
        // Si hay email, verificar en BD
        if (data.user.email) {
          await checkUserInDb(data.user.email)
        }
      } else {
        setMessage('Error al obtener usuario actual')
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error)
      setMessage('Error al verificar usuario')
    }
  }

  const checkUserInDb = async (email: string) => {
    try {
      const response = await fetch(`/api/find-user?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      setUserInDb(data)
    } catch (error) {
      console.error('Error al buscar usuario en BD:', error)
    }
  }

  const registerUser = async () => {
    if (!currentUser?.email) {
      setMessage('No hay email para registrar')
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
          email: currentUser.email,
          subscriptionStatus: 'free'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Usuario registrado exitosamente')
        await checkUserInDb(currentUser.email)
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
    if (!authLoading) {
      checkCurrentUser()
    }
  }, [authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">No autenticado</h2>
            <p className="text-red-600">Por favor, inicia sesión para verificar tu registro.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Verificar Registro de Usuario</h1>
        
        {currentUser && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Usuario Actual</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {currentUser.id}</p>
              <p><span className="font-medium">Email:</span> {currentUser.email || 'No disponible'}</p>
              <p><span className="font-medium">Tiene email:</span> {currentUser.hasEmail ? 'Sí' : 'No'}</p>
              <p><span className="font-medium">Creado en:</span> {new Date(currentUser.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}

        {userInDb && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado en Base de Datos</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Encontrado:</span> {userInDb.found ? 'Sí' : 'No'}</p>
              {userInDb.user && (
                <>
                  <p><span className="font-medium">Email en BD:</span> {userInDb.user.email}</p>
                  <p><span className="font-medium">Estado de suscripción:</span> {userInDb.user.subscriptionStatus}</p>
                  <p><span className="font-medium">Última actividad:</span> {new Date(userInDb.user.lastActiveAt).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones</h2>
          
          {currentUser?.email && !userInDb?.found && (
            <button
              onClick={registerUser}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registrando...' : '📝 Registrar Usuario'}
            </button>
          )}

          {currentUser?.email && userInDb?.found && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">✅ El usuario ya está registrado en la base de datos.</p>
            </div>
          )}

          {!currentUser?.email && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">⚠️ El usuario no tiene un email asociado, por lo tanto no se puede registrar en la base de datos local.</p>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}