'use client'

import { useEffect, useState } from 'react'

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const runDebug = async () => {
      try {
        // Debug del servidor
        const response = await fetch('/api/debug/auth')
        const serverData = await response.json()
        setDebugInfo(serverData)

        // Debug del cliente
        const clientData = {
          timestamp: new Date().toISOString(),
          isClient: typeof window !== 'undefined',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'No disponible',
          envVars: {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurado' : '❌ No configurado',
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Configurado' : '❌ No configurado',
          }
        }
        setClientInfo(clientData)

        // Intentar cargar Firebase
        try {
          const { getAuth } = await import('firebase/auth')
          const { initializeApp } = await import('firebase/app')
          
          const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
          }

          console.log('Config de Firebase:', firebaseConfig)
          
          // Verificar si ya existe una app
          const existingApp = typeof window !== 'undefined' ? (window as any).firebaseApp : null
          const app = existingApp || initializeApp(firebaseConfig)
          const auth = getAuth(app)
          
          console.log('Firebase app creado:', !!app)
          console.log('Firebase auth creado:', !!auth)
          
        } catch (firebaseError) {
          console.error('Error al crear Firebase:', firebaseError)
          setError(`Error Firebase: ${firebaseError instanceof Error ? firebaseError.message : 'Error desconocido'}`)
        }

      } catch (err) {
        console.error('Error en debug:', err)
        setError(`Error general: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      }
    }

    runDebug()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticación</h1>
        
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Servidor</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(clientInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Consola del Navegador</h2>
            <p className="text-gray-400">Abre la consola del navegador (F12) para ver los logs detallados de Firebase.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
