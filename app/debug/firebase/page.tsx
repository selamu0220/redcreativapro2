'use client'

import { useState, useEffect } from 'react'

export default function DebugFirebase() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        console.log('🧪 Fetching Firebase debug info...')
        
        // Verificar si estamos en el cliente
        console.log('🌐 Window available:', typeof window !== 'undefined')
        console.log('🌐 Process env available:', typeof process !== 'undefined')
        
        const response = await fetch('/api/debug/firebase')
        const data = await response.json()
        
        console.log('📊 Debug data received:', data)
        setDebugInfo(data)
        
        // Verificar Firebase directamente
        if (typeof window !== 'undefined') {
          console.log('🔍 Checking Firebase directly...')
          
          // Intentar importar Firebase dinámicamente
          try {
            const { getAuth } = await import('firebase/auth')
            const { getApp } = await import('firebase/app')
            
            const app = getApp()
            const auth = getAuth(app)
            
            console.log('✅ Firebase App:', app)
            console.log('✅ Firebase Auth:', auth)
            console.log('✅ Current user:', auth.currentUser)
          } catch (firebaseError: any) {
            console.error('❌ Firebase direct error:', firebaseError)
          }
        }
        
      } catch (err: any) {
        console.error('❌ Debug fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Firebase</h1>
        <div className="text-zinc-400">Cargando información...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
        <div className="bg-red-900/20 border border-red-800 rounded-md p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Firebase</h1>
      
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Estado General</h2>
          <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
          <p><strong>Environment:</strong> {debugInfo.environment}</p>
          <p><strong>Is Client:</strong> {debugInfo.isClient ? '✅ Sí' : '❌ No'}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Variables de Entorno</h2>
          {Object.entries(debugInfo.envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between py-1">
              <span>{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Configuración Firebase</h2>
          <pre className="text-sm text-zinc-300 overflow-auto">
            {JSON.stringify(debugInfo.firebaseConfig, null, 2)}
          </pre>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Estado Firebase Auth</h2>
          <p className={debugInfo.firebaseAuth.includes('✅') ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.firebaseAuth}
          </p>
          {debugInfo.error && (
            <p className="text-red-400 text-sm mt-2">{debugInfo.error}</p>
          )}
        </div>

        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Instrucciones</h2>
          <p className="text-blue-300 text-sm">
            Abre la consola del navegador (F12) para ver los logs detallados de Firebase.
            Esto ayudará a identificar dónde exactamente está fallando la inicialización.
          </p>
        </div>
      </div>
    </div>
  )
}