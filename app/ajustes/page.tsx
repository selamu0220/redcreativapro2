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

  // Estados para configuración de email
  const [emailProvider, setEmailProvider] = useState('gmail') // 'gmail', 'web3forms', 'resend'
  const [gmailUser, setGmailUser] = useState('')
  const [gmailPassword, setGmailPassword] = useState('')
  const [showGmailPassword, setShowGmailPassword] = useState(false)
  
  // Estados para Web3Forms (súper fácil)
  const [web3formsKey, setWeb3formsKey] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  
  // Estados para Resend (fácil)
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendFromEmail, setResendFromEmail] = useState('')
  
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false)

  // Opciones de proveedores de email
  const emailProviders = [
    {
      id: 'web3forms',
      name: 'Web3Forms',
      difficulty: 'Súper Fácil',
      description: 'Solo necesitas un email. Sin configuración técnica.',
      icon: '🌐',
      color: 'green',
      setup: '1 minuto'
    },
    {
      id: 'resend',
      name: 'Resend',
      difficulty: 'Fácil',
      description: 'API moderna y confiable. Configuración simple.',
      icon: '📨',
      color: 'blue',
      setup: '3 minutos'
    },
    {
      id: 'gmail',
      name: 'Gmail SMTP',
      difficulty: 'Técnico',
      description: 'Requiere contraseña de aplicación de Google.',
      icon: '📧',
      color: 'yellow',
      setup: '5-10 minutos'
    }
  ]

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadConfiguration()
    }
  }, [])

  const loadConfiguration = async () => {
    // Cargar configuración del proveedor de email desde el backend
    if (user?.email) {
      try {
        const response = await fetch(`/api/email-providers?email=${encodeURIComponent(user.email || '')}`)
        const data = await response.json()
        
        if (response.ok && data.hasConfig) {
          console.log('📧 Configuración cargada:', data)
          setEmailProvider(data.provider || 'gmail')
          
          // Cargar configuración específica según el proveedor
          if (data.config) {
            // Gmail
            if (data.config.gmailUser) setGmailUser(data.config.gmailUser)
            if (data.config.gmailPassword) setGmailPassword(data.config.gmailPassword)
            
            // Web3Forms
            if (data.config.web3formsKey) setWeb3formsKey(data.config.web3formsKey)
            if (data.config.senderEmail) setSenderEmail(data.config.senderEmail)
            
            // Resend
            if (data.config.resendApiKey) setResendApiKey(data.config.resendApiKey)
            if (data.config.resendFromEmail) setResendFromEmail(data.config.resendFromEmail)
          }
        } else {
          // Si no hay configuración en el backend, cargar desde localStorage
          console.log('📧 Cargando desde localStorage...')
          const savedProvider = safeLocalStorage.getItem('email_provider') || 'gmail'
          setEmailProvider(savedProvider)
          
          // Gmail
          const savedGmailUser = safeLocalStorage.getItem('gmail_user')
          const savedGmailPassword = safeLocalStorage.getItem('gmail_app_password')
          if (savedGmailUser) setGmailUser(savedGmailUser)
          if (savedGmailPassword) setGmailPassword(savedGmailPassword)
          
          // Web3Forms
          const savedWeb3formsKey = safeLocalStorage.getItem('web3forms_key')
          const savedSenderEmail = safeLocalStorage.getItem('sender_email')
          if (savedWeb3formsKey) setWeb3formsKey(savedWeb3formsKey)
          if (savedSenderEmail) setSenderEmail(savedSenderEmail)
          
          // Resend
          const savedResendApiKey = safeLocalStorage.getItem('resend_api_key')
          const savedResendFromEmail = safeLocalStorage.getItem('resend_from_email')
          if (savedResendApiKey) setResendApiKey(savedResendApiKey)
          if (savedResendFromEmail) setResendFromEmail(savedResendFromEmail)
        }
      } catch (error) {
        console.error('Error loading email provider config from server:', error)
        // Fallback a localStorage si hay error
        const savedProvider = safeLocalStorage.getItem('email_provider') || 'gmail'
        setEmailProvider(savedProvider)
      }
    }
    
    // Cargar API key de Gemini desde localStorage
    const savedGeminiApiKey = safeLocalStorage.getItem('gemini_api_key')
    if (savedGeminiApiKey) setGeminiApiKey(savedGeminiApiKey)
  }

  const testGmailCredentials = async () => {
    if (!gmailUser || !gmailPassword) {
      alert('Por favor completa ambos campos de Gmail primero')
      return
    }

    if (!user?.email) {
      alert('No hay usuario autenticado')
      return
    }

    try {
      console.log('🧪 Testing Gmail credentials...')
      const response = await fetch('/api/test-gmail-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          gmailUser: gmailUser,
          gmailPassword: gmailPassword
        })
      })

      const data = await response.json()
      console.log('Test result:', data)

      if (data.success) {
        alert(`✅ Prueba exitosa!\n\nDetalles:\n• Guardado: ${data.saveResult ? 'OK' : 'FALLO'}\n• Recuperado: ${data.retrievedCredentials.found ? 'OK' : 'FALLO'}\n• Contraseña coincide: ${data.retrievedCredentials.passwordMatches ? 'OK' : 'FALLO'}`)
      } else {
        alert(`❌ Prueba falló:\n\n${data.error}\n\nRevisa la consola para más detalles.`)
      }
    } catch (error) {
      console.error('Error testing Gmail credentials:', error)
      alert(`❌ Error en la prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
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
        
        alert('✅ Configuración de Gmail guardada exitosamente en el servidor')
      } catch (error: any) {
        console.error('Error saving Gmail credentials to server:', error)
        
        // Mostrar error más específico
        let errorMessage = 'Error desconocido';
        if (error instanceof Error) {
          try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.error || error.message;
          } catch {
            errorMessage = error.message;
          }
        }
        
        alert(`❌ Configuración guardada localmente, pero hubo un error al guardar en el servidor:\n\n${errorMessage}\n\nPuedes usar la configuración local por ahora, pero es recomendable resolver este problema.`)
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

  // Función universal para guardar cualquier proveedor
  const saveEmailProviderConfiguration = async () => {
    if (typeof window === 'undefined') return
    
    let config = {}
    let missingFields = []
    
    // Validar campos según el proveedor seleccionado
    if (emailProvider === 'web3forms') {
      if (!web3formsKey) missingFields.push('Web3Forms Access Key')
      if (!senderEmail) missingFields.push('Tu Email')
      config = { web3formsKey, senderEmail }
    } else if (emailProvider === 'resend') {
      if (!resendApiKey) missingFields.push('Resend API Key')
      if (!resendFromEmail) missingFields.push('Email remitente')
      config = { resendApiKey, resendFromEmail }
    } else if (emailProvider === 'gmail') {
      if (!gmailUser) missingFields.push('Email de Gmail')
      if (!gmailPassword) missingFields.push('Contraseña de Aplicación')
      config = { gmailUser, gmailPassword }
    }
    
    if (missingFields.length > 0) {
      alert(`Por favor completa los siguientes campos:\n• ${missingFields.join('\n• ')}`)
      return
    }
    
    // Guardar en localStorage como respaldo
    safeLocalStorage.setItem('email_provider', emailProvider)
    Object.entries(config).forEach(([key, value]) => {
      if (value) safeLocalStorage.setItem(key.replace(/([A-Z])/g, '_$1').toLowerCase(), value as string)
    })
    
    // Guardar en el backend
    if (user?.email) {
      try {
        const response = await fetch('/api/email-providers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            provider: emailProvider,
            config: config
          })
        })

        const data = await response.json()
        
        if (response.ok) {
          alert(`✅ Configuración de ${emailProvider === 'web3forms' ? 'Web3Forms' : emailProvider === 'resend' ? 'Resend' : 'Gmail'} guardada exitosamente`)
        } else {
          alert(`❌ Error al guardar en el servidor: ${data.error}\n\nConfiguración guardada localmente.`)
        }
      } catch (error) {
        console.error('Error saving email provider config:', error)
        alert('❌ Error al conectar con el servidor. Configuración guardada localmente.')
      }
    } else {
      alert(`✅ Configuración de ${emailProvider === 'web3forms' ? 'Web3Forms' : emailProvider === 'resend' ? 'Resend' : 'Gmail'} guardada localmente`)
    }
  }

  // Funciones para Web3Forms
  const saveWeb3FormsConfiguration = saveEmailProviderConfiguration

  const testWeb3FormsConfiguration = async () => {
    if (!web3formsKey || !senderEmail) {
      alert('Por favor completa ambos campos de Web3Forms primero')
      return
    }

    try {
      // Enviar email de prueba usando Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          name: 'Red Creativa Pro Beta',
          email: senderEmail,
          subject: '🧪 Prueba de configuración Web3Forms',
          message: `¡Hola!\n\nEsta es una prueba de configuración de Web3Forms desde Red Creativa Pro Beta.\n\nSi recibes este email, significa que tu configuración está funcionando correctamente.\n\n✅ Web3Forms Key: ${web3formsKey.substring(0, 8)}...\n✅ Email configurado: ${senderEmail}\n\nFecha de prueba: ${new Date().toLocaleString('es-ES')}\n\n¡Ya puedes enviar emails desde la aplicación!`
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(`✅ ¡Prueba exitosa!\n\nSe ha enviado un email de prueba a: ${senderEmail}\n\nRevisa tu bandeja de entrada (y spam) para confirmar que llegó correctamente.`)
      } else {
        alert(`❌ Error en la prueba:\n\n${data.message || 'Error desconocido'}\n\nVerifica tu Access Key y email.`)
      }
    } catch (error) {
      console.error('Error testing Web3Forms:', error)
      alert(`❌ Error al probar Web3Forms: ${error instanceof Error ? error.message : 'Error de conexión'}`)
    }
  }

  // Funciones para Resend
  const saveResendConfiguration = saveEmailProviderConfiguration

  const testResendConfiguration = async () => {
    if (!resendApiKey || !resendFromEmail) {
      alert('Por favor completa ambos campos de Resend primero')
      return
    }

    try {
      // Enviar email de prueba usando Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [user?.email || resendFromEmail],
          subject: '🧪 Prueba de configuración Resend',
          html: `
            <h2>¡Hola desde Red Creativa Pro Beta!</h2>
            <p>Esta es una prueba de configuración de Resend.</p>
            <p>Si recibes este email, significa que tu configuración está funcionando correctamente.</p>
            <hr>
            <p><strong>Detalles de la configuración:</strong></p>
            <ul>
              <li>✅ API Key: ${resendApiKey.substring(0, 8)}...</li>
              <li>✅ Email remitente: ${resendFromEmail}</li>
              <li>✅ Fecha de prueba: ${new Date().toLocaleString('es-ES')}</li>
            </ul>
            <p>¡Ya puedes enviar emails desde la aplicación!</p>
          `
        })
      })

      const data = await response.json()

      if (response.ok && data.id) {
        alert(`✅ ¡Prueba exitosa!\n\nEmail enviado con ID: ${data.id}\n\nRevisa tu bandeja de entrada para confirmar que llegó correctamente.`)
      } else {
        alert(`❌ Error en la prueba:\n\n${data.message || JSON.stringify(data)}\n\nVerifica tu API Key y email remitente.`)
      }
    } catch (error) {
      console.error('Error testing Resend:', error)
      alert(`❌ Error al probar Resend: ${error instanceof Error ? error.message : 'Error de conexión'}`)
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
            {/* Configuración de Envío de Emails */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Configuración de Envío de Emails</h2>
              
              {/* Selector de Proveedor */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-white">Elige tu método de envío preferido:</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={saveEmailProviderConfiguration}
                      className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <span>💾</span>
                      <span>Guardar Configuración</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {emailProviders.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => {
                        setEmailProvider(provider.id)
                        safeLocalStorage.setItem('email_provider', provider.id)
                        console.log(`📧 Proveedor seleccionado: ${provider.name}`)
                      }}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                        emailProvider === provider.id
                          ? 'border-white bg-zinc-800'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{provider.icon}</span>
                          <span className="font-medium text-white">{provider.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          provider.color === 'green' ? 'bg-green-900/50 text-green-300' :
                          provider.color === 'blue' ? 'bg-blue-900/50 text-blue-300' :
                          'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {provider.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-2">{provider.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">⏱️ {provider.setup}</span>
                        {emailProvider === provider.id && (
                          <span className="text-xs text-green-400">✅ Seleccionado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración específica según el proveedor seleccionado */}
              {emailProvider === 'web3forms' && (
                <div className="space-y-4 border-t border-zinc-700 pt-6">
                  <div className="bg-green-900/20 border border-green-800/50 rounded-md p-4 mb-4">
                    <h4 className="font-semibold text-green-200 mb-2 text-sm">🌐 Web3Forms - Súper Fácil</h4>
                    <p className="text-xs text-green-300/80 mb-2">
                      Web3Forms es la opción más simple. Solo necesitas registrarte y obtener una clave gratuita.
                    </p>
                    <ol className="text-xs text-green-300/80 space-y-1">
                      <li>1. Ve a <a href="https://web3forms.com" target="_blank" className="underline text-green-200">web3forms.com</a></li>
                      <li>2. Regístrate gratis con tu email</li>
                      <li>3. Copia tu Access Key</li>
                      <li>4. Pégala abajo y ¡listo!</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Tu Email (donde recibirás los emails) *
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Web3Forms Access Key *
                    </label>
                    <input
                      type="text"
                      value={web3formsKey}
                      onChange={(e) => setWeb3formsKey(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      Obtén tu clave gratuita en{' '}
                      <a 
                        href="https://web3forms.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 underline"
                      >
                        web3forms.com
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveWeb3FormsConfiguration}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Guardar Web3Forms
                    </button>
                    <button
                      type="button"
                      onClick={testWeb3FormsConfiguration}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      🧪 Probar Web3Forms
                    </button>
                  </div>
                </div>
              )}

              {emailProvider === 'resend' && (
                <div className="space-y-4 border-t border-zinc-700 pt-6">
                  <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4 mb-4">
                    <h4 className="font-semibold text-blue-200 mb-2 text-sm">📨 Resend - Fácil y Confiable</h4>
                    <p className="text-xs text-blue-300/80 mb-2">
                      Resend es una API moderna y confiable para envío de emails. Configuración simple y rápida.
                    </p>
                    <ol className="text-xs text-blue-300/80 space-y-1">
                      <li>1. Ve a <a href="https://resend.com" target="_blank" className="underline text-blue-200">resend.com</a></li>
                      <li>2. Crea una cuenta gratuita</li>
                      <li>3. Genera una API Key</li>
                      <li>4. Configura tu dominio (opcional)</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email remitente *
                    </label>
                    <input
                      type="email"
                      value={resendFromEmail}
                      onChange={(e) => setResendFromEmail(e.target.value)}
                      placeholder="noreply@tudominio.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      Usa tu dominio verificado o onboarding@resend.dev para pruebas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Resend API Key *
                    </label>
                    <input
                      type="password"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      Obtén tu API key en{' '}
                      <a 
                        href="https://resend.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        resend.com/api-keys
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveResendConfiguration}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Guardar Resend
                    </button>
                    <button
                      type="button"
                      onClick={testResendConfiguration}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      🧪 Probar Resend
                    </button>
                  </div>
                </div>
              )}

              {emailProvider === 'gmail' && (
                <div className="space-y-4 border-t border-zinc-700 pt-6">
                  <div className="bg-amber-900/20 border border-amber-800/50 rounded-md p-4 mb-4">
                    <h4 className="font-semibold text-amber-200 mb-2 text-sm">📧 Gmail SMTP - Opción Técnica</h4>
                    <p className="text-xs text-amber-300/80 mb-2">
                      Usa tu cuenta de Gmail existente. Requiere configuración de contraseña de aplicación.
                    </p>
                    <ol className="text-xs text-amber-300/80 space-y-1">
                      <li>1. Activa la verificación en dos pasos en tu cuenta de Google</li>
                      <li>2. Genera una contraseña de aplicación para "Correo"</li>
                      <li>3. Copia la contraseña generada (16 dígitos) en el campo inferior</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email de Gmail *
                    </label>
                    <input
                      type="email"
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      placeholder="tucorreo@gmail.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    />
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
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
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
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Configuración de Google
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveGmailConfiguration}
                      className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                      Guardar Gmail
                    </button>
                    <button
                      type="button"
                      onClick={testGmailCredentials}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      🧪 Probar Conexión
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
              )}
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