'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import VideoModal from '../components/VideoModal'
import { useAuth } from '../hooks/useAuth'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'

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
  const { user, logout } = useAuth()
  const { post } = useAuthenticatedFetch()

  const [gmailUser, setGmailUser] = useState('')
  const [gmailPassword, setGmailPassword] = useState('')
  const [showGmailPassword, setShowGmailPassword] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadConfiguration()
    }
  }, [])

  const loadConfiguration = async () => {
    // Cargar credenciales de Gmail desde el backend
    if (user?.email) {
      try {
        const response = await fetch(`/api/gmail-credentials?email=${encodeURIComponent(user.email || '')}`)
        const data = await response.json()
        
        if (response.ok && data.hasCredentials) {
          setGmailUser(data.gmailUser)
          setGmailPassword(data.gmailPassword)
          // También guardar en localStorage como respaldo
          safeLocalStorage.setItem('gmail_user', data.gmailUser)
          safeLocalStorage.setItem('gmail_app_password', data.gmailPassword)
        } else {
          // Si no hay credenciales en el backend, cargar desde localStorage
          const savedGmailUser = safeLocalStorage.getItem('gmail_user')
          const savedGmailPassword = safeLocalStorage.getItem('gmail_app_password')
          if (savedGmailUser) setGmailUser(savedGmailUser)
          if (savedGmailPassword) setGmailPassword(savedGmailPassword)
        }
      } catch (error) {
        console.error('Error loading Gmail credentials from server:', error)
        // Fallback a localStorage si hay error
        const savedGmailUser = safeLocalStorage.getItem('gmail_user')
        const savedGmailPassword = safeLocalStorage.getItem('gmail_app_password')
        if (savedGmailUser) setGmailUser(savedGmailUser)
        if (savedGmailPassword) setGmailPassword(savedGmailPassword)
      }
    }
    
    // Cargar API key de Gemini desde localStorage
    const savedGeminiApiKey = safeLocalStorage.getItem('gemini_api_key')
    if (savedGeminiApiKey) setGeminiApiKey(savedGeminiApiKey)
  }

  const saveGmailConfiguration = async () => {
    if (typeof window === 'undefined') return
    
    if (!gmailUser || !gmailPassword) {
      alert('Por favor completa ambos campos de Gmail')
      return
    }
    
    // Guardar en localStorage como respaldo
    safeLocalStorage.setItem('gmail_user', gmailUser)
    safeLocalStorage.setItem('gmail_app_password', gmailPassword)
    
    // Guardar en el backend
    if (user?.email) {
      try {
        const data = await post('/api/gmail-credentials', {
          email: user.email,
          gmailUser: gmailUser,
          gmailPassword: gmailPassword
        })
        
        alert('Configuración de Gmail guardada exitosamente en el servidor')
      } catch (error: any) {
        console.error('Error saving Gmail credentials to server:', error)
        alert('Configuración guardada localmente, pero hubo un error al guardar en el servidor')
      }
    } else {
      alert('Configuración de Gmail guardada localmente')
    }
  }

  const clearGmailConfiguration = async () => {
    if (typeof window === 'undefined') return
    if (confirm('¿Estás seguro de que quieres limpiar la configuración de Gmail?')) {
      // Limpiar localStorage
      safeLocalStorage.removeItem('gmail_user')
      safeLocalStorage.removeItem('gmail_app_password')
      setGmailUser('')
      setGmailPassword('')
      
      // Limpiar del backend
      if (user?.email) {
        try {
          const response = await fetch(`/api/gmail-credentials?email=${encodeURIComponent(user.email || '')}`, {
            method: 'DELETE'
          })

          const data = await response.json()
          
          if (response.ok) {
            alert('Configuración de Gmail limpiada exitosamente del servidor')
          } else {
            console.error('Error clearing Gmail credentials from server:', data.error)
            alert('Configuración limpiada localmente, pero hubo un error al limpiar del servidor')
          }
        } catch (error) {
          console.error('Error clearing Gmail credentials from server:', error)
          alert('Configuración limpiada localmente, pero hubo un error al limpiar del servidor')
        }
      } else {
        alert('Configuración de Gmail limpiada localmente')
      }
    }
  }

  const saveGeminiApiKey = async () => {
    if (typeof window === 'undefined') return
    
    if (!geminiApiKey.trim()) {
      alert('Por favor ingresa una API key válida')
      return
    }
    
    // Guardar en localStorage
    safeLocalStorage.setItem('gemini_api_key', geminiApiKey)
    alert('API key de Gemini guardada exitosamente')
  }

  const clearGeminiApiKey = async () => {
    if (typeof window === 'undefined') return
    if (confirm('¿Estás seguro de que quieres limpiar la API key de Gemini?')) {
      safeLocalStorage.removeItem('gemini_api_key')
      setGeminiApiKey('')
      alert('API key de Gemini limpiada exitosamente')
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

            {/* Configuración de API Key de Gemini */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Configuración de API Key de Google Gemini</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    API Key de Gemini *
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiApiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                      className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showGeminiApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Obtén tu API key en{' '}
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-zinc-300 underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4">
                  <h4 className="font-semibold text-blue-200 mb-2 text-sm">Instrucciones:</h4>
                  <ol className="text-xs text-blue-300/80 space-y-1">
                    <li>1. Ve a Google AI Studio y crea una cuenta</li>
                    <li>2. Genera una nueva API key</li>
                    <li>3. Copia la API key y pégala en el campo superior</li>
                    <li>4. Esta API key se usará para generar contenido con Gemini</li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={saveGeminiApiKey}
                    className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Guardar API Key
                  </button>
                  <button
                    type="button"
                    onClick={clearGeminiApiKey}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 transition-colors"
                  >
                    Limpiar API Key
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
      </div>
    </ProtectedRoute>
  )
}

export default AjustesPage