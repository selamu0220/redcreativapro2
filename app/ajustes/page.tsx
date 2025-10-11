'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// import ProtectedRoute from '../components/ProtectedRoute' // Temporalmente deshabilitado para diagnóstico
import VideoModal from '../components/VideoModal'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { useSimpleTranslations } from '@/app/lib/simple-translations'
import { useAuth } from '../hooks/useAuth'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import { useOpenRouterSync } from '../hooks/useOpenRouterSync'
// Removed old email system imports


// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }
}

function AjustesPage() {
  const { user, logout, isAuthenticated, loading, error } = useAuth()
  const { get, post, del } = useAuthenticatedFetch()
  const { t } = useSimpleTranslations()

  const [showVideoModal, setShowVideoModal] = useState(false)
  
  // Usar el hook de sincronización para OpenRouter
  const {
    openRouterApiKey,
    openRouterModel,
    saveOpenRouterConfig,
    clearOpenRouterConfig
  } = useOpenRouterSync()
  
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false)
  const [isTestingOpenRouterApiKey, setIsTestingOpenRouterApiKey] = useState(false)
  const [openRouterApiKeyTestResult, setOpenRouterApiKeyTestResult] = useState<string | null>(null)
  
  // Función local para manejar cambio de modelo
  const handleOpenRouterModelChange = (newModel: string) => {
    // Guardar inmediatamente el nuevo modelo con la API key actual
    saveOpenRouterConfig(openRouterApiKey, newModel)
  }
  
  // Función local para manejar cambio de API key
  const handleOpenRouterApiKeyChange = (newApiKey: string) => {
    // Guardar inmediatamente la nueva API key con el modelo actual
    saveOpenRouterConfig(newApiKey, openRouterModel)
  }

  useEffect(() => {
    console.log('✅ Configuración cargada - solo OpenRouter disponible');
  }, [])

  const saveOpenRouterApiKey = async () => {
    if (typeof window === 'undefined') return
    
    if (!openRouterApiKey.trim()) {
      alert('Por favor ingresa una API key válida')
      return
    }
    
    // Usar el hook de sincronización
    saveOpenRouterConfig(openRouterApiKey, openRouterModel)
    alert('Configuración de OpenRouter guardada exitosamente')
  }

  const clearOpenRouterApiKey = async () => {
    if (typeof window === 'undefined') return
    if (confirm('¿Estás seguro de que quieres limpiar la API key de OpenRouter?')) {
      // Usar el hook de sincronización
      clearOpenRouterConfig()
      setOpenRouterApiKeyTestResult(null)
      alert('Configuración de OpenRouter limpiada exitosamente')
    }
  }

  const testOpenRouterApiKey = async () => {
    if (!openRouterApiKey.trim()) {
      alert('Por favor ingresa una API key válida')
      return
    }

    setIsTestingOpenRouterApiKey(true)
    setOpenRouterApiKeyTestResult(null)

    try {
      const response = await fetch('/api/test-openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: openRouterApiKey,
          model: openRouterModel
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setOpenRouterApiKeyTestResult('✅ API Key válida y funcionando correctamente')
        // Guardar automáticamente si la prueba es exitosa usando el hook de sincronización
        saveOpenRouterConfig(openRouterApiKey, openRouterModel)
      } else {
        setOpenRouterApiKeyTestResult(`❌ Error: ${data.error || 'API Key inválida'}`)
      }
    } catch (error) {
      console.error('Error testing OpenRouter API key:', error)
      setOpenRouterApiKeyTestResult('❌ Error de conexión al probar la API key')
    } finally {
      setIsTestingOpenRouterApiKey(false)
    }
  }

  // Old email system functions removed



  return (
    // <ProtectedRoute> // Temporalmente deshabilitado para diagnóstico
    <div>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                    <span className="text-black font-bold text-xs">RC</span>
                  </div>
                  <span className="text-sm font-medium text-white">Red Creativa Pro</span>
                </Link>
                <div className="h-4 w-px bg-zinc-700"></div>
                <h1 className="text-sm font-medium text-zinc-400">Ajustes</h1>
                
                {/* Botón de Tutorial de YouTube */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                  title="Ver tutorial de configuración"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="font-medium">📺 Tutorial</span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-zinc-400">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* Sistema de correos antiguo completamente eliminado */}

            {/* Configuración de API Key de OpenRouter */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Configuración de OpenRouter</h2>
                <div className="flex items-center space-x-2">
                  {openRouterApiKey && (
                    <span className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded-full">
                      ✓ API Key Configurada
                    </span>
                  )}
                  {!openRouterApiKey && (
                    <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full">
                      ⚠ API Key Requerida
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    API Key de OpenRouter *
                  </label>
                  <div className="relative">
                    <input
                      type={showOpenRouterApiKey ? 'text' : 'password'}
                      value={openRouterApiKey}
                      onChange={(e) => handleOpenRouterApiKeyChange(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenRouterApiKey(!showOpenRouterApiKey)}
                      className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showOpenRouterApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Obtén tu API key en{' '}
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-zinc-300 underline"
                    >
                      OpenRouter Keys
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Modelo de OpenRouter
                  </label>
                  <select
                    value={openRouterModel}
                    onChange={(e) => handleOpenRouterModelChange(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  >
                    <option value="openai/gpt-4o-mini">GPT-4o Mini (Rápido y Económico)</option>
                    <option value="openai/gpt-4o">GPT-4o (Avanzado)</option>
                    <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (Estándar)</option>
                    <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Rápido)</option>
                    <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (Balanceado)</option>
                    <option value="anthropic/claude-3-opus">Claude 3 Opus (Avanzado)</option>
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">
                    GPT-4o Mini es más económico, GPT-4o y Claude 3 Opus son más precisos
                  </p>
                </div>

                {openRouterApiKeyTestResult && (
                  <div className={`p-3 rounded-md text-sm ${
                    openRouterApiKeyTestResult.includes('✅') 
                      ? 'bg-green-900/20 border border-green-800/50 text-green-300'
                      : 'bg-red-900/20 border border-red-800/50 text-red-300'
                  }`}>
                    {openRouterApiKeyTestResult}
                  </div>
                )}

                <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4">
                  <h4 className="font-semibold text-blue-200 mb-2 text-sm">Instrucciones:</h4>
                  <ol className="text-xs text-blue-300/80 space-y-1">
                    <li>1. Ve a OpenRouter.ai y crea una cuenta</li>
                    <li>2. Genera una nueva API key en la sección Keys</li>
                    <li>3. Copia la API key y pégala en el campo superior</li>
                    <li>4. Selecciona el modelo que prefieras usar</li>
                    <li>5. Prueba la configuración antes de guardar</li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={testOpenRouterApiKey}
                    disabled={isTestingOpenRouterApiKey || !openRouterApiKey.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isTestingOpenRouterApiKey ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Probando...</span>
                      </>
                    ) : (
                      <>
                        <span>🧪</span>
                        <span>Probar API Key</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={saveOpenRouterApiKey}
                    className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    💾 Guardar
                  </button>
                  <button
                    type="button"
                    onClick={clearOpenRouterApiKey}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 transition-colors"
                  >
                    🗑️ Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoId="k5OYlxYdIuA"
          title="Introducción a Red Creativa Pro"
        />
        
        {/* Modales del sistema de email antiguo eliminados */}

        {/* Language Toggle */}
        <SimpleLanguageToggle />
      </div>
    </div>
    // </ProtectedRoute> // Temporalmente deshabilitado para diagnóstico
  )
}

export default AjustesPage