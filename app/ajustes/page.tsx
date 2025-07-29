'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

function AjustesPage() {
  const { user, logout } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gemini-1.5-flash')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [gmailUser, setGmailUser] = useState('')
  const [gmailPassword, setGmailPassword] = useState('')
  const [showGmailPassword, setShowGmailPassword] = useState(false)

  const availableModels = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Modelo rápido y eficiente (recomendado)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Modelo avanzado con mayor capacidad' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Modelo principal de Google' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Modelo con capacidades de visión' }
  ]

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    const savedApiKey = localStorage.getItem('gemini_api_key')
    const savedModel = localStorage.getItem('gemini_model')
    const savedTemperature = localStorage.getItem('gemini_temperature')
    const savedMaxTokens = localStorage.getItem('gemini_max_tokens')
    const savedGmailUser = localStorage.getItem('gmail_user')
    const savedGmailPassword = localStorage.getItem('gmail_app_password')

    if (savedModel) setModel(savedModel)
    if (savedTemperature) setTemperature(parseFloat(savedTemperature))
    if (savedMaxTokens) setMaxTokens(parseInt(savedMaxTokens))
    if (savedGmailUser) setGmailUser(savedGmailUser)
    if (savedGmailPassword) setGmailPassword(savedGmailPassword)

    // Cargar API key: primero desde localStorage, luego desde el servidor
    let finalApiKey = savedApiKey
    
    if (!savedApiKey && user?.email) {
      try {
        const response = await fetch(`/api/ai-studio-key?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()
        
        if (response.ok && data.apiKey) {
          finalApiKey = data.apiKey
          // Guardar en localStorage para futuras cargas
          localStorage.setItem('gemini_api_key', data.apiKey)
        }
      } catch (error) {
        console.error('Error loading API key from server:', error)
      }
    }

    if (finalApiKey) {
      setApiKey(finalApiKey)
      checkConnection(finalApiKey)
    }
  }

  const saveConfiguration = async () => {
    // Guardar en localStorage
    localStorage.setItem('gemini_api_key', apiKey)
    localStorage.setItem('gemini_model', model)
    localStorage.setItem('gemini_temperature', temperature.toString())
    localStorage.setItem('gemini_max_tokens', maxTokens.toString())
    
    // Guardar API key en la base de datos del backend
    if (apiKey && user?.email) {
      try {
        const response = await fetch('/api/ai-studio-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            apiKey: apiKey
          }),
        })

        const data = await response.json()
        
        if (response.ok) {
          alert('Configuración guardada exitosamente en el servidor')
        } else {
          console.error('Error saving API key to server:', data.error)
          alert('Configuración guardada localmente, pero hubo un error al guardar en el servidor')
        }
      } catch (error) {
        console.error('Error saving API key to server:', error)
        alert('Configuración guardada localmente, pero hubo un error al guardar en el servidor')
      }
    } else {
      alert('Configuración guardada exitosamente')
    }
    
    checkConnection(apiKey)
  }

  const saveGmailConfiguration = () => {
    localStorage.setItem('gmail_user', gmailUser)
    localStorage.setItem('gmail_app_password', gmailPassword)
    alert('Configuración de Gmail guardada exitosamente')
  }

  const clearGmailConfiguration = () => {
    if (confirm('¿Estás seguro de que quieres limpiar la configuración de Gmail?')) {
      localStorage.removeItem('gmail_user')
      localStorage.removeItem('gmail_app_password')
      setGmailUser('')
      setGmailPassword('')
      alert('Configuración de Gmail limpiada')
    }
  }

  const checkConnection = async (keyToTest?: string) => {
    const testKey = keyToTest || apiKey
    if (!testKey) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: testKey,
          model
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsConnected(true)
        setTestResult('✅ Conexión exitosa con la API de Gemini')
      } else {
        setIsConnected(false)
        setTestResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setIsConnected(false)
      setTestResult('❌ Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const testConfiguration = async () => {
    if (!apiKey) {
      alert('Por favor ingresa una API Key')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model,
          temperature,
          maxTokens,
          testMessage: 'Hola, este es un mensaje de prueba. Responde brevemente.'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Prueba exitosa: ${data.response}`)
        setIsConnected(true)
      } else {
        setTestResult(`❌ Error en la prueba: ${data.error}`)
        setIsConnected(false)
      }
    } catch (error) {
      setTestResult('❌ Error al realizar la prueba')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const clearConfiguration = async () => {
    if (confirm('¿Estás seguro de que quieres limpiar toda la configuración?')) {
      // Limpiar localStorage
      localStorage.removeItem('gemini_api_key')
      localStorage.removeItem('gemini_model')
      localStorage.removeItem('gemini_temperature')
      localStorage.removeItem('gemini_max_tokens')
      
      // Eliminar API key del servidor
      if (user?.email) {
        try {
          const response = await fetch(`/api/ai-studio-key?email=${encodeURIComponent(user.email)}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            console.log('API key removed from server successfully')
          } else {
            console.error('Error removing API key from server')
          }
        } catch (error) {
          console.error('Error removing API key from server:', error)
        }
      }
      
      setApiKey('')
      setModel('gemini-pro')
      setTemperature(0.7)
      setMaxTokens(1000)
      setIsConnected(false)
      setTestResult('')
      
      alert('Configuración limpiada')
    }
  }

  return (
    <ProtectedRoute>
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
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  isConnected ? 'bg-green-900/50 text-green-400 border border-green-800/50' : 'bg-red-900/50 text-red-400 border border-red-800/50'
                }`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </div>
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
            {/* Estado de conexión */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Estado de la Conexión</h2>
                <button
                  type="button"
                  onClick={() => checkConnection()}
                  disabled={!apiKey || isLoading}
                  className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-md text-sm ${
                  isConnected ? 'bg-green-900/20 border border-green-800/50 text-green-400' : 'bg-red-900/20 border border-red-800/50 text-red-400'
                }`}>
                  {testResult}
                </div>
              )}
            </div>

            {/* Configuración de API */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Configuración de Gemini AI</h2>
              
              <div className="space-y-4">
                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    API Key de Google Gemini *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Ingresa tu API Key de Gemini"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Obtén tu API Key en{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-zinc-300 underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Modelo de IA
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  >
                    {availableModels.map((modelOption) => (
                      <option key={modelOption.id} value={modelOption.id} className="bg-zinc-800 text-white">
                        {modelOption.name} - {modelOption.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperatura */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Temperatura: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 mt-1">
                    <span>Conservador</span>
                    <span>Creativo</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Máximo de Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    Controla la longitud máxima de las respuestas
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={saveConfiguration}
                    className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={testConfiguration}
                    disabled={!apiKey || isLoading}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Probando...' : 'Probar'}
                  </button>
                  <button
                    type="button"
                    onClick={clearConfiguration}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Configuración de Gmail SMTP */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Configuración de Gmail SMTP</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email de Gmail *
                  </label>
                  <input
                    type="email"
                    value={gmailUser}
                    onChange={(e) => setGmailUser(e.target.value)}
                    placeholder="tucorreo@gmail.com"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    Usa tu email de Gmail principal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Contraseña de Aplicación *
                  </label>
                  <div className="relative">
                    <input
                      type={showGmailPassword ? 'text' : 'password'}
                      value={gmailPassword}
                      onChange={(e) => setGmailPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGmailPassword(!showGmailPassword)}
                      className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showGmailPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Genera una contraseña de aplicación en{' '}
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-zinc-300 underline"
                    >
                      Configuración de Google
                    </a>
                  </p>
                </div>

                <div className="bg-amber-900/20 border border-amber-800/50 rounded-md p-4">
                  <h4 className="font-semibold text-amber-200 mb-2 text-sm">Instrucciones:</h4>
                  <ol className="text-xs text-amber-300/80 space-y-1">
                    <li>1. Activa la verificación en dos pasos en tu cuenta de Google</li>
                    <li>2. Genera una contraseña de aplicación para "Correo"</li>
                    <li>3. Copia la contraseña generada (16 dígitos) en el campo superior</li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={saveGmailConfiguration}
                    className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Guardar Gmail
                  </button>
                  <button
                    type="button"
                    onClick={clearGmailConfiguration}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 transition-colors"
                  >
                    Limpiar Gmail
                  </button>
                </div>
              </div>
            </div>

            {/* Guía paso a paso */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Guía de Configuración</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Obtener API Key</h3>
                    <p className="text-xs text-zinc-400">
                      Ve a Google AI Studio y crea una nueva API Key para Gemini
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Configurar Parámetros</h3>
                    <p className="text-xs text-zinc-400">
                      Ajusta el modelo, temperatura y tokens según tus necesidades
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Probar y Guardar</h3>
                    <p className="text-xs text-zinc-400">
                      Realiza una prueba de conexión y guarda la configuración
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Herramientas integradas */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Herramientas de IA</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                  <h3 className="font-medium text-white text-sm">Escritor IA</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Mejora y optimiza textos con IA
                  </p>
                </div>
                <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                  <h3 className="font-medium text-white text-sm">Correos IA</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Genera emails profesionales automáticamente
                  </p>
                </div>
                <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                  <h3 className="font-medium text-white text-sm">Chat con Prompts</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Conversaciones inteligentes con prompts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default AjustesPage