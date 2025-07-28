'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '../components/ProtectedRoute'
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

  const availableModels = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Modelo rápido y eficiente (recomendado)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Modelo avanzado con mayor capacidad' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Modelo principal de Google' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Modelo con capacidades de visión' }
  ]

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = () => {
    const savedApiKey = localStorage.getItem('gemini_api_key')
    const savedModel = localStorage.getItem('gemini_model')
    const savedTemperature = localStorage.getItem('gemini_temperature')
    const savedMaxTokens = localStorage.getItem('gemini_max_tokens')

    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
    if (savedTemperature) setTemperature(parseFloat(savedTemperature))
    if (savedMaxTokens) setMaxTokens(parseInt(savedMaxTokens))

    if (savedApiKey) {
      checkConnection(savedApiKey)
    }
  }

  const saveConfiguration = () => {
    localStorage.setItem('gemini_api_key', apiKey)
    localStorage.setItem('gemini_model', model)
    localStorage.setItem('gemini_temperature', temperature.toString())
    localStorage.setItem('gemini_max_tokens', maxTokens.toString())
    
    alert('Configuración guardada exitosamente')
    checkConnection(apiKey)
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

  const clearConfiguration = () => {
    if (confirm('¿Estás seguro de que quieres limpiar toda la configuración?')) {
      localStorage.removeItem('gemini_api_key')
      localStorage.removeItem('gemini_model')
      localStorage.removeItem('gemini_temperature')
      localStorage.removeItem('gemini_max_tokens')
      
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Red Creativa Pro
                </Link>
                <span className="text-gray-300">|</span>
                <h1 className="text-lg font-semibold text-gray-900">Configuración IA</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </div>
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Estado de conexión */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Estado de la Conexión</h2>
                <button
                  onClick={() => checkConnection()}
                  disabled={!apiKey || isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                >
                  {isLoading ? 'Verificando...' : 'Verificar Conexión'}
                </button>
              </div>
              
              {testResult && (
                <div className={`p-4 rounded-lg ${
                  isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={isConnected ? 'text-green-700' : 'text-red-700'}>
                    {testResult}
                  </p>
                </div>
              )}
            </div>

            {/* Configuración de API */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Configuración de Gemini AI</h2>
              
              <div className="space-y-6">
                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key de Google Gemini *
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Ingresa tu API Key de Gemini"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Obtén tu API Key en{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo de IA
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableModels.map((modelOption) => (
                      <option key={modelOption.id} value={modelOption.id}>
                        {modelOption.name} - {modelOption.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperatura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Más conservador</span>
                    <span>Más creativo</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Controla la longitud máxima de las respuestas
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-4">
                  <button
                    onClick={saveConfiguration}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    Guardar Configuración
                  </button>
                  <button
                    onClick={testConfiguration}
                    disabled={!apiKey || isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                  >
                    {isLoading ? 'Probando...' : 'Probar Configuración'}
                  </button>
                  <button
                    onClick={clearConfiguration}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
                  >
                    Limpiar Todo
                  </button>
                </div>
              </div>
            </div>

            {/* Guía paso a paso */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Guía de Configuración</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Obtener API Key</h3>
                    <p className="text-sm text-gray-600">
                      Ve a Google AI Studio y crea una nueva API Key para Gemini
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Configurar Parámetros</h3>
                    <p className="text-sm text-gray-600">
                      Ajusta el modelo, temperatura y tokens según tus necesidades
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Probar y Guardar</h3>
                    <p className="text-sm text-gray-600">
                      Realiza una prueba de conexión y guarda la configuración
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Herramientas integradas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Herramientas de IA Integradas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-blue-600">Escritor IA</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Mejora y optimiza textos con inteligencia artificial
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-green-600">Correos IA</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Genera emails profesionales automáticamente
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-purple-600">Chat con Prompts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Conversaciones inteligentes con prompts predefinidos
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

const [gmailUser, setGmailUser] = useState('')
const [gmailPassword, setGmailPassword] = useState('')
const [showGmailPassword, setShowGmailPassword] = useState(false)

// Add to loadConfiguration:
const savedGmailUser = localStorage.getItem('gmail_user')
const savedGmailPassword = localStorage.getItem('gmail_app_password')
if (savedGmailUser) setGmailUser(savedGmailUser)
if (savedGmailPassword) setGmailPassword(savedGmailPassword)

// Add new functions:
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

// Add new panel after the existing configuration panel:
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-6">Configuración de Gmail SMTP</h2>
  
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email de Gmail *
      </label>
      <input
        type="email"
        value={gmailUser}
        onChange={(e) => setGmailUser(e.target.value)}
        placeholder="tucorreo@gmail.com"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="text-sm text-gray-500 mt-1">
        Usa tu email de Gmail principal
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Contraseña de Aplicación *
      </label>
      <div className="relative">
        <input
          type={showGmailPassword ? 'text' : 'password'}
          value={gmailPassword}
          onChange={(e) => setGmailPassword(e.target.value)}
          placeholder="xxxx-xxxx-xxxx-xxxx"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowGmailPassword(!showGmailPassword)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          {showGmailPassword ? '🙈' : '👁️'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Genera una contraseña de aplicación en{' '}
        <a 
          href="https://myaccount.google.com/apppasswords" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          Configuración de Google
        </a>
      </p>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="font-semibold text-yellow-800 mb-2">Instrucciones:</h4>
      <ol className="text-sm text-yellow-700 space-y-1">
        <li>1. Activa la verificación en dos pasos en tu cuenta de Google</li>
        <li>2. Genera una contraseña de aplicación para "Correo"</li>
        <li>3. Copia la contraseña generada (16 dígitos) en el campo superior</li>
      </ol>
    </div>

    <div className="flex space-x-4">
      <button
        onClick={saveGmailConfiguration}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
      >
        Guardar Configuración Gmail
      </button>
      <button
        onClick={clearGmailConfiguration}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
      >
        Limpiar Configuración
      </button>
    </div>
  </div>
</div>