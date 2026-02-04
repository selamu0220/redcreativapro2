'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function RegisterUserButton() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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
      } else {
        setMessage(`❌ Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (error) {
      setMessage(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user?.email) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-yellow-800 mb-2">Registrar Usuario Manualmente</h3>
      <p className="text-yellow-700 text-sm mb-3">
        Si las estadísticas no cargan, puedes intentar registrar tu usuario manualmente.
      </p>
      <button
        onClick={registerUser}
        disabled={loading}
        className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '📝 Registrando...' : '📝 Registrar Usuario'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
