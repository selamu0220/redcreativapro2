'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import GuestTrialInterface from '../components/GuestTrialInterface'
import VideoModal from '../components/VideoModal'
import MobileLayout from '../components/MobileLayout'
import AutomatedCampaigns from '../components/AutomatedCampaigns'
import { useAuth } from '../hooks/useAuth'
import { useGuestTrial } from '../hooks/useGuestTrial'
import { ContactData, CampaignData, EmailCollectionPageData } from '../lib/database'

function CorreosIAPage() {
  const { user, logout } = useAuth();
  const { isTrialActive, canStartTrial, stopGuestTrial } = useGuestTrial();
  
  // Estados para generación de emails individuales
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [purpose, setPurpose] = useState('')
  const [context, setContext] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showGmailScript, setShowGmailScript] = useState(false)
  
  // Estados para el sistema de email marketing
  const [activeTab, setActiveTab] = useState('generator') // 'generator', 'contacts', 'campaigns', 'pages', 'automation'
  const [contacts, setContacts] = useState<ContactData[]>([])
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [emailPages, setEmailPages] = useState<EmailCollectionPageData[]>([])
  const [loading, setLoading] = useState(false)
  
  // Estados para modales
  const [showContactModal, setShowContactModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showPageModal, setShowPageModal] = useState(false)
  const [showContactSelector, setShowContactSelector] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactData | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(null)
  const [editingPage, setEditingPage] = useState<EmailCollectionPageData | null>(null)
  
  // Estados para el editor de plantillas
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [templateContent, setTemplateContent] = useState('')
  const [templatePreview, setTemplatePreview] = useState('')

  const emailPurposes = [
    'Solicitud de información',
    'Propuesta comercial',
    'Seguimiento de cliente',
    'Agradecimiento',
    'Disculpa o resolución de problema',
    'Invitación a evento',
    'Recordatorio',
    'Presentación de servicios',
    'Solicitud de reunión',
    'Otro'
  ]

  // Cargar datos al cambiar de tab
  useEffect(() => {
    if (user?.email) {
      if (activeTab === 'contacts') {
        loadContacts()
      } else if (activeTab === 'campaigns') {
        loadCampaigns()
      } else if (activeTab === 'pages') {
        loadEmailPages()
      }
    }
  }, [activeTab, user?.email])

  // Funciones para cargar datos
  const loadContacts = async () => {
    setLoading(true)
    try {
      console.log('Loading contacts for user:', user?.email)
      const response = await fetch('/api/contacts', {
        headers: { 'x-user-email': user?.email || '' }
      })
      console.log('Contacts response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Contacts data:', data)
        setContacts(data.contacts)
      } else {
        console.error('Contacts response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
      console.error('Contacts error details:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : '')
    } finally {
      setLoading(false)
    }
  }

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      console.log('Loading campaigns for user:', user?.email)
      const response = await fetch('/api/campaigns', {
        headers: { 'x-user-email': user?.email || '' }
      })
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Campaigns data:', data)
        setCampaigns(data.campaigns)
      } else {
        console.error('Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : '')
    } finally {
      setLoading(false)
    }
  }

  const loadEmailPages = async () => {
    setLoading(true)
    try {
      console.log('Loading email pages for user:', user?.email)
      const response = await fetch('/api/email-pages', {
        headers: { 'x-user-email': user?.email || '' }
      })
      console.log('Email pages response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Email pages data:', data)
        setEmailPages(data.pages)
      } else {
        console.error('Email pages response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading email pages:', error)
      console.error('Email pages error details:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : '')
    } finally {
      setLoading(false)
    }
  }

  // Funciones para manejar contactos
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) return
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ contactId })
      })
      
      if (response.ok) {
        loadContacts()
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  // Funciones para manejar campañas
  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('¿Estás seguro de que quieres enviar esta campaña?')) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ campaignId })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Campaña enviada exitosamente a ${data.sentCount} contactos`)
        loadCampaigns()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      alert('Error al enviar la campaña')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta campaña?')) return
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ campaignId })
      })
      
      if (response.ok) {
        loadCampaigns()
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  // Funciones para manejar páginas de email
  const handleDeleteEmailPage = async (pageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta página?')) return
    
    try {
      const response = await fetch('/api/email-pages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ pageId })
      })
      
      if (response.ok) {
        loadEmailPages()
      }
    } catch (error) {
      console.error('Error deleting email page:', error)
    }
  }

  const generateEmail = async () => {
    if (!recipient || !subject || !purpose) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsGenerating(true)
    try {
      // API key por defecto (oculta para el usuario)
      const defaultApiKey = 'AIzaSyALwXOW_onexmTnq6RXNipyWCqVUVXjwqw'
      
      // Obtener configuración de API desde localStorage
      const savedApiKey = localStorage.getItem('gemini_api_key')
      const hasCustomApiKey = localStorage.getItem('has_custom_api_key') === 'true'
      
      let finalApiKey = defaultApiKey
      if (hasCustomApiKey && savedApiKey) {
        finalApiKey = savedApiKey
      }
      
      const model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
      const temperature = localStorage.getItem('gemini_temperature') || '0.7';
      const maxTokens = localStorage.getItem('gemini_max_tokens') || '1000';

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': finalApiKey,
          'x-model': model,
          'x-temperature': temperature,
          'x-max-tokens': maxTokens,
        },
        body: JSON.stringify({
          recipient,
          subject,
          purpose,
          context
        }),
      })

      if (!response.ok) {
        throw new Error('Error al generar el email')
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar el email. Verifica tu configuración de API.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
    alert('Email copiado al portapapeles')
  }

  const clearForm = () => {
    setRecipient('')
    setSubject('')
    setPurpose('')
    setContext('')
    setGeneratedEmail('')
  }

  const gmailAppsScript = `
function sendGeneratedEmail() {
  // Configuración del email
  const recipient = "${recipient}";
  const subject = "${subject}";
  const body = \`${generatedEmail.replace(/`/g, '\\`')}\`;
  
  try {
    // Enviar el email
    GmailApp.sendEmail(recipient, subject, body);
    
    // Mostrar mensaje de confirmación
    SpreadsheetApp.getUi().alert('Email enviado exitosamente a ' + recipient);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error al enviar email: ' + error.toString());
  }
}
`

  const downloadGmailScript = () => {
    const blob = new Blob([gmailAppsScript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gmail-script.gs'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendEmail = async () => {
    if (!generatedEmail) return;
    
    let gmailUser = ''
    let gmailPassword = ''
    
    // Intentar obtener credenciales del backend primero
    if (user?.email) {
      try {
        const response = await fetch(`/api/gmail-credentials?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()
        
        if (response.ok && data.hasCredentials) {
          gmailUser = data.gmailUser
          gmailPassword = data.gmailPassword
        }
      } catch (error) {
        console.error('Error loading Gmail credentials from server:', error)
      }
    }
    
    // Si no se obtuvieron del backend, usar localStorage como respaldo
    if (!gmailUser || !gmailPassword) {
      gmailUser = localStorage.getItem('gmail_user') || ''
      gmailPassword = localStorage.getItem('gmail_app_password') || ''
    }
    
    if (!gmailUser || !gmailPassword) {
      // Verificar si el usuario necesita ser notificado
      if (user?.email) {
        try {
          const notificationResponse = await fetch(`/api/gmail-notification?email=${encodeURIComponent(user.email)}`)
          const notificationData = await notificationResponse.json()
          
          if (notificationData.shouldNotify) {
            alert('Por favor configura tus credenciales de Gmail en la página de ajustes')
            // Marcar que el usuario ya fue notificado
            await fetch('/api/gmail-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            })
          }
        } catch (error) {
          console.error('Error checking Gmail notification:', error)
          alert('Por favor configura tus credenciales de Gmail en la página de ajustes')
        }
      } else {
        alert('Por favor configura tus credenciales de Gmail en la página de ajustes')
      }
      return
    }
    
    setIsSending(true)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ 
          to: recipient, 
          subject, 
          text: generatedEmail,
          gmailUser,
          gmailPassword
        }),
      })
      if (!response.ok) throw new Error('Error al enviar')
      alert('Email enviado exitosamente')
    } catch (error) {
      alert('Error al enviar el email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <ProtectedRoute>
      <MobileLayout>
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
                <h1 className="text-sm font-medium text-zinc-400">Correos IA</h1>
                
                {/* Botón de Tutorial de YouTube */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors duration-200 bg-red-900/20 hover:bg-red-900/30 px-3 py-2 rounded-lg border border-red-800/30 hover:border-red-700/50"
                  title="Ver tutorial de cómo usar Chat IA"
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

        <div className="container mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-zinc-800">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'generator'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  Generador de Emails
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'contacts'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  Contactos ({contacts.length})
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'campaigns'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  Campañas ({campaigns.length})
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'pages'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  Páginas de Captura ({emailPages.length})
                </button>
                <button
                   onClick={() => setActiveTab('automation')}
                   className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                     activeTab === 'automation'
                       ? 'border-white text-white'
                       : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                   }`}
                 >
                   🤖 Automatización IA
                 </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de configuración */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Configuración del Email</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Destinatario *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder="destinatario@email.com"
                          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowContactSelector(true)}
                          className="px-3 py-2 bg-zinc-700 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-600 transition-colors text-sm"
                          title="Importar desde contactos"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Asunto *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Asunto del email"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Propósito del Email *
                      </label>
                      <select
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                      >
                        <option value="" className="text-zinc-400">Selecciona el propósito...</option>
                        {emailPurposes.map((purposeOption, index) => (
                          <option key={index} value={purposeOption} className="text-white bg-zinc-800">
                            {purposeOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Contexto Adicional
                      </label>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Proporciona contexto adicional, detalles específicos, tono deseado, etc."
                        rows={4}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      onClick={generateEmail}
                      disabled={!recipient || !subject || !purpose || isGenerating}
                      className="flex-1 bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? 'Generando...' : 'Generar Email'}
                    </button>
                    <button
                      type="button"
                      onClick={clearForm}
                      className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel de vista previa */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Vista Previa del Email</h2>
                    {generatedEmail && (
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm hover:bg-zinc-700 transition-colors"
                        >
                          Copiar
                        </button>
                        <button
                          type="button"
                          onClick={sendEmail}
                          disabled={isSending}
                          className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSending ? 'Enviando...' : 'Enviar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGmailScript(!showGmailScript)}
                          className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm hover:bg-zinc-700 transition-colors"
                        >
                          Script
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {recipient && (
                    <div className="mb-4 p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                      <div className="text-sm text-zinc-300">
                        <strong>Para:</strong> {recipient}
                      </div>
                      <div className="text-sm text-zinc-300">
                        <strong>Asunto:</strong> {subject}
                      </div>
                    </div>
                  )}

                  <div className="min-h-96 p-4 bg-zinc-800 border border-zinc-700 rounded-md">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span className="ml-2 text-zinc-400 text-sm">Generando email...</span>
                      </div>
                    ) : generatedEmail ? (
                      <div className="whitespace-pre-wrap text-zinc-100 text-sm leading-relaxed">
                        {generatedEmail}
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-sm flex items-center justify-center h-96">
                        El email generado aparecerá aquí...
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel de Gmail Apps Script */}
                {showGmailScript && generatedEmail && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Gmail Apps Script</h3>
                      <button
                        type="button"
                        onClick={downloadGmailScript}
                        className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                      >
                        Descargar .gs
                      </button>
                    </div>
                    
                    <div className="mb-4 p-4 bg-amber-900/20 border border-amber-800/50 rounded-md">
                      <h4 className="font-semibold text-amber-200 mb-2 text-sm">Instrucciones:</h4>
                      <ol className="text-sm text-amber-300/80 space-y-1">
                        <li>1. Ve a script.google.com</li>
                        <li>2. Crea un nuevo proyecto</li>
                        <li>3. Pega el código generado</li>
                        <li>4. Guarda y ejecuta la función</li>
                      </ol>
                    </div>
                    
                    <pre className="bg-zinc-800 border border-zinc-700 p-4 rounded-md text-sm overflow-x-auto">
                      <code className="text-zinc-300">{gmailAppsScript}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Gestión de Contactos</h2>
                <button
                  onClick={() => {
                    setEditingContact(null)
                    setShowContactModal(true)
                  }}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Agregar Contacto
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : contacts.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                  <p className="text-zinc-400 mb-4">No tienes contactos aún</p>
                  <button
                    onClick={() => {
                      setEditingContact(null)
                      setShowContactModal(true)
                    }}
                    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Agregar tu primer contacto
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Etiquetas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-zinc-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {contact.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                              {contact.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                contact.isSubscribed 
                                  ? 'bg-green-900/20 text-green-400 border border-green-800'
                                  : 'bg-red-900/20 text-red-400 border border-red-800'
                              }`}>
                                {contact.isSubscribed ? 'Suscrito' : 'No suscrito'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                              {contact.tags?.join(', ') || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditingContact(contact)
                                  setShowContactModal(true)
                                }}
                                className="text-zinc-400 hover:text-white mr-3 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Campañas de Email</h2>
                <button
                  onClick={() => {
                    setEditingCampaign(null)
                    setShowCampaignModal(true)
                  }}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Nueva Campaña
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                  <p className="text-zinc-400 mb-4">No tienes campañas aún</p>
                  <button
                    onClick={() => {
                      setEditingCampaign(null)
                      setShowCampaignModal(true)
                    }}
                    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Crear tu primera campaña
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{campaign.name}</h3>
                          <p className="text-sm text-zinc-400 mb-2">{campaign.subject}</p>
                          <div className="flex items-center space-x-4 text-sm text-zinc-500">
                            <span>Contactos: {campaign.recipientCount}</span>
                            <span>Estado: 
                              <span className={`ml-1 ${
                                campaign.status === 'sent' ? 'text-green-400' :
                                campaign.status === 'draft' ? 'text-yellow-400' :
                                'text-zinc-400'
                              }`}>
                                {campaign.status === 'sent' ? 'Enviada' :
                                 campaign.status === 'draft' ? 'Borrador' : 'Programada'}
                              </span>
                            </span>
                            <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleSendCampaign(campaign.id)}
                              disabled={loading}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
                            >
                              Enviar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingCampaign(campaign)
                              setShowCampaignModal(true)
                            }}
                            className="bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm hover:bg-zinc-600 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                          {campaign.content.length > 200 
                            ? `${campaign.content.substring(0, 200)}...` 
                            : campaign.content
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email Pages Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Páginas de Captación</h2>
                <button
                  onClick={() => {
                    setEditingPage(null)
                    setShowPageModal(true)
                  }}
                  className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                >
                  Nueva Página
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : emailPages.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                  <p className="text-zinc-400 mb-4">No tienes páginas de captación aún</p>
                  <button
                    onClick={() => {
                      setEditingPage(null)
                      setShowPageModal(true)
                    }}
                    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Crear tu primera página
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {emailPages.map((page) => (
                    <div key={page.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{page.title}</h3>
                          <p className="text-sm text-zinc-400 mb-2">{page.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-zinc-500">
                            <span>Estado: 
                              <span className={`ml-1 ${
                                page.isActive ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {page.isActive ? 'Activa' : 'Inactiva'}
                              </span>
                            </span>
                            <span>Creada: {new Date(page.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/collect/${page.id}`
                              navigator.clipboard.writeText(url)
                              alert('URL copiada al portapapeles')
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            Copiar URL
                          </button>
                          <button
                            onClick={() => {
                              window.open(`/collect/${page.id}`, '_blank')
                            }}
                            className="bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm hover:bg-zinc-600 transition-colors"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => {
                              setEditingPage(page)
                              setShowPageModal(true)
                            }}
                            className="bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm hover:bg-zinc-600 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEmailPage(page.id)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <AutomatedCampaigns />
            </div>
          )}
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const contactData = {
                  email: formData.get('email') as string,
                  name: formData.get('name') as string,
                  tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
                  isSubscribed: formData.get('isSubscribed') === 'on'
                }
                
                if (editingContact) {
                  // Update contact
                  fetch('/api/contacts', {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-user-email': user?.email || ''
                    },
                    body: JSON.stringify({ ...contactData, id: editingContact.id })
                  }).then(async (response) => {
                    if (response.ok) {
                      loadContacts()
                      setShowContactModal(false)
                      setEditingContact(null)
                    } else {
                      const error = await response.json()
                      alert(`Error: ${error.error}`)
                    }
                  }).catch(error => {
                    console.error('Error updating contact:', error)
                    alert('Error al actualizar el contacto')
                  })
                } else {
                  // Create contact
                  fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-user-email': user?.email || ''
                    },
                    body: JSON.stringify(contactData)
                  }).then(async (response) => {
                    if (response.ok) {
                      loadContacts()
                      setShowContactModal(false)
                    } else {
                      const error = await response.json()
                      alert(`Error: ${error.error}`)
                    }
                  }).catch(error => {
                    console.error('Error creating contact:', error)
                    alert('Error al crear el contacto')
                  })
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingContact?.email || ''}
                      required
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingContact?.name || ''}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Etiquetas (separadas por comas)</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingContact?.tags?.join(', ') || ''}
                      placeholder="cliente, prospecto, vip"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isSubscribed"
                      id="isSubscribed"
                      defaultChecked={editingContact?.isSubscribed ?? true}
                      className="mr-2"
                    />
                    <label htmlFor="isSubscribed" className="text-sm text-zinc-300">Suscrito</label>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    {editingContact ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const campaignData = {
                  name: formData.get('name') as string,
                  subject: formData.get('subject') as string,
                  content: formData.get('content') as string,
                  status: formData.get('status') as string
                }
                
                if (editingCampaign) {
                  // Update campaign
                  fetch('/api/campaigns', {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-user-email': user?.email || ''
                    },
                    body: JSON.stringify({ ...campaignData, id: editingCampaign.id })
                  }).then(async (response) => {
                    if (response.ok) {
                      loadCampaigns()
                      setShowCampaignModal(false)
                      setEditingCampaign(null)
                    } else {
                      const error = await response.json()
                      alert(`Error: ${error.error}`)
                    }
                  }).catch(error => {
                    console.error('Error updating campaign:', error)
                    alert('Error al actualizar la campaña')
                  })
                } else {
                  // Create campaign
                  fetch('/api/campaigns', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-user-email': user?.email || ''
                    },
                    body: JSON.stringify(campaignData)
                  }).then(async (response) => {
                    if (response.ok) {
                      loadCampaigns()
                      setShowCampaignModal(false)
                    } else {
                      const error = await response.json()
                      alert(`Error: ${error.error}`)
                    }
                  }).catch(error => {
                    console.error('Error creating campaign:', error)
                    alert('Error al crear la campaña')
                  })
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre de la Campaña *</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingCampaign?.name || ''}
                      required
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Asunto del Email *</label>
                    <input
                      type="text"
                      name="subject"
                      defaultValue={editingCampaign?.subject || ''}
                      required
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-zinc-300">Contenido del Email *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setTemplateContent(editingCampaign?.content || '')
                          setShowTemplateEditor(true)
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        🎨 Editor Visual
                      </button>
                    </div>
                    <textarea
                      name="content"
                      defaultValue={editingCampaign?.content || ''}
                      required
                      rows={8}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Estado</label>
                    <select
                      name="status"
                      defaultValue={editingCampaign?.status || 'draft'}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="draft">Borrador</option>
                      <option value="scheduled">Programada</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    {editingCampaign ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Page Modal */}
        {showPageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingPage ? 'Editar Página' : 'Nueva Página de Captación'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const pageData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  buttonText: formData.get('buttonText') as string,
                  successMessage: formData.get('successMessage') as string,
                  isActive: formData.get('isActive') === 'on',
                  collectName: formData.get('collectName') === 'on',
                  customFields: (formData.get('customFields') as string).split(',').map(field => field.trim()).filter(Boolean)
                }
                
                if (editingPage) {
                  // Update page
                  fetch('/api/email-pages', {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-user-email': user?.email || ''
                    },
                    body: JSON.stringify({ ...pageData, id: editingPage.id })
                  }).then(async (response) => {
                    if (response.ok) {
                      loadEmailPages()
                      setShowPageModal(false)
                      setEditingPage(null)
                    } else {
                      const error = await response.json()
                      alert(`Error: ${error.error}`)
                    }
                  }).catch(error => {
                    console.error('Error updating page:', error)
                    alert('Error al actualizar la página')
                  })
                } else {
                  // Create page
                  fetch('/api/email-pages', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-user-email': user?.email || ''
                    },
                    body: JSON.stringify(pageData)
                  }).then(async (response) => {
                    if (response.ok) {
                      loadEmailPages()
                      setShowPageModal(false)
                    } else {
                      const error = await response.json()
                      alert(`Error: ${error.error}`)
                    }
                  }).catch(error => {
                    console.error('Error creating page:', error)
                    alert('Error al crear la página')
                  })
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Título *</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingPage?.title || ''}
                      required
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Descripción *</label>
                    <textarea
                      name="description"
                      defaultValue={editingPage?.description || ''}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Texto del Botón</label>
                    <input
                      type="text"
                      name="buttonText"
                      defaultValue={editingPage?.buttonText || 'Suscribirse'}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Mensaje de Éxito</label>
                    <input
                      type="text"
                      name="successMessage"
                      defaultValue={editingPage?.successMessage || '¡Gracias por suscribirte!'}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Campos Personalizados (separados por comas)</label>
                    <input
                      type="text"
                      name="customFields"
                      defaultValue={editingPage?.customFields?.join(', ') || ''}
                      placeholder="empresa, teléfono, ciudad"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        defaultChecked={editingPage?.isActive ?? true}
                        className="mr-2"
                      />
                      <label htmlFor="isActive" className="text-sm text-zinc-300">Página Activa</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="collectName"
                        id="collectName"
                        defaultChecked={editingPage?.collectName ?? true}
                        className="mr-2"
                      />
                      <label htmlFor="collectName" className="text-sm text-zinc-300">Recopilar Nombre</label>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    {editingPage ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPageModal(false)}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contact Selector Modal */}
        {showContactSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Seleccionar Contacto</h3>
              
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No tienes contactos disponibles</p>
                  <button
                    onClick={() => {
                      setShowContactSelector(false)
                      setActiveTab('contacts')
                    }}
                    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Ir a Contactos
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {contacts.filter(contact => contact.isSubscribed).map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setRecipient(contact.email)
                        setShowContactSelector(false)
                      }}
                      className="p-3 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{contact.email}</p>
                          {contact.name && (
                            <p className="text-zinc-400 text-sm">{contact.name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {contact.tags.length > 2 && (
                                <span className="text-zinc-400 text-xs">+{contact.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowContactSelector(false)}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Editor Modal */}
        {showTemplateEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
              <div className="flex h-full">
                {/* Editor Panel */}
                <div className="w-1/2 p-6 border-r border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Editor de Plantilla</h3>
                  
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-zinc-800 rounded-lg">
                    <button
                      onClick={() => {
                        const newContent = templateContent + '\n<h1 style="color: #333; font-size: 24px; margin: 20px 0;">Título Principal</h1>'
                        setTemplateContent(newContent)
                        setTemplatePreview(newContent)
                      }}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-600 transition-colors"
                    >
                      📝 Título
                    </button>
                    <button
                      onClick={() => {
                        const newContent = templateContent + '\n<p style="color: #666; line-height: 1.6; margin: 15px 0;">Tu texto aquí...</p>'
                        setTemplateContent(newContent)
                        setTemplatePreview(newContent)
                      }}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-600 transition-colors"
                    >
                      📄 Párrafo
                    </button>
                    <button
                      onClick={() => {
                        const imageUrl = prompt('URL de la imagen:')
                        if (imageUrl) {
                          const newContent = templateContent + `\n<img src="${imageUrl}" alt="Imagen" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px;" />`
                          setTemplateContent(newContent)
                          setTemplatePreview(newContent)
                        }
                      }}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-600 transition-colors"
                    >
                      🖼️ Imagen
                    </button>
                    <button
                      onClick={() => {
                        const buttonText = prompt('Texto del botón:', 'Haz clic aquí')
                        const buttonUrl = prompt('URL del botón:', 'https://ejemplo.com')
                        if (buttonText && buttonUrl) {
                          const newContent = templateContent + `\n<a href="${buttonUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">${buttonText}</a>`
                          setTemplateContent(newContent)
                          setTemplatePreview(newContent)
                        }
                      }}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-600 transition-colors"
                    >
                      🔗 Botón
                    </button>
                    <button
                      onClick={() => {
                        const newContent = templateContent + '\n<div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff; border-radius: 4px;">\n  <p style="margin: 0; color: #333;">Contenido destacado</p>\n</div>'
                        setTemplateContent(newContent)
                        setTemplatePreview(newContent)
                      }}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-600 transition-colors"
                    >
                      💡 Destacado
                    </button>
                    <button
                      onClick={() => {
                        const newContent = `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">\n  <h1 style="color: #333; text-align: center; margin-bottom: 30px;">¡Hola!</h1>\n  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Este es tu email personalizado.</p>\n  <div style="text-align: center; margin: 30px 0;">\n    <a href="#" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Botón de Acción</a>\n  </div>\n  <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">Gracias por tu atención</p>\n</div>`
                        setTemplateContent(newContent)
                        setTemplatePreview(newContent)
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      ✨ Plantilla Base
                    </button>
                  </div>
                  
                  {/* HTML Editor */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Código HTML</label>
                    <textarea
                      value={templateContent}
                      onChange={(e) => {
                        setTemplateContent(e.target.value)
                        setTemplatePreview(e.target.value)
                      }}
                      rows={15}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none font-mono text-sm"
                      placeholder="Escribe tu HTML aquí o usa los botones de arriba..."
                    />
                  </div>
                </div>
                
                {/* Preview Panel */}
                <div className="w-1/2 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>
                  <div className="bg-white rounded-lg p-4 h-96 overflow-y-auto">
                    <div 
                      dangerouslySetInnerHTML={{ __html: templatePreview || '<p style="color: #999; text-align: center; padding: 40px;">La vista previa aparecerá aquí...</p>' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Footer Buttons */}
              <div className="flex justify-between items-center p-6 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setTemplateContent('')
                    setTemplatePreview('')
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  🗑️ Limpiar
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Actualizar el contenido en el formulario de campaña
                      const contentTextarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement
                      if (contentTextarea) {
                        contentTextarea.value = templateContent
                      }
                      setShowTemplateEditor(false)
                    }}
                    className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors"
                  >
                    ✅ Usar Plantilla
                  </button>
                  <button
                    onClick={() => setShowTemplateEditor(false)}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId="k5OYlxYdIuA"
        title="Introducción a Red Creativa Pro"
      />
      </MobileLayout>
    </ProtectedRoute>
  )
}

// Componente wrapper que maneja tanto usuarios registrados como invitados
function CorreosIAWrapper() {
  const { user } = useAuth();
  const { isTrialActive, canStartTrial, startGuestTrial } = useGuestTrial();
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  // Efecto para iniciar la prueba automáticamente
  useEffect(() => {
    if (!user && !isTrialActive && canStartTrial && !isStartingTrial) {
      console.log('Auto-starting guest trial for Correos IA');
      setIsStartingTrial(true);
      startGuestTrial();
      // Reset después de un breve delay
      setTimeout(() => setIsStartingTrial(false), 1000);
    }
  }, [user, isTrialActive, canStartTrial, startGuestTrial, isStartingTrial]);

  // Si hay usuario registrado, mostrar la versión protegida
  if (user) {
    return <CorreosIAPage />;
  }

  // Si está iniciando la prueba, mostrar loading
  if (isStartingTrial || (!isTrialActive && canStartTrial)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Iniciando prueba gratuita...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario pero tiene prueba activa, mostrar en interfaz de invitado
  if (isTrialActive) {
    return (
      <GuestTrialInterface
        toolName="Chat IA"
        onClose={() => window.location.href = '/'}
      >
        <CorreosIAPage />
      </GuestTrialInterface>
    );
  }

  // Si no hay usuario y no puede iniciar prueba (tiempo agotado), redirigir a home
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Tiempo de prueba agotado</h2>
        <p className="text-muted-foreground mb-4">
          Tu tiempo de prueba gratuita ha terminado. Regístrate para continuar usando el Chat IA.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default CorreosIAWrapper