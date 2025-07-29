'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

function CorreosIAPage() {
  const { user, logout } = useAuth();
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [purpose, setPurpose] = useState('')
  const [context, setContext] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showGmailScript, setShowGmailScript] = useState(false)

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

  const generateEmail = async () => {
    if (!recipient || !subject || !purpose) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    
    // Obtener credenciales de Gmail desde localStorage
    const gmailUser = localStorage.getItem('gmail_user')
    const gmailPassword = localStorage.getItem('gmail_app_password')
    
    if (!gmailUser || !gmailPassword) {
      alert('Por favor configura tus credenciales de Gmail en la página de ajustes')
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
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="destinatario@email.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    />
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
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default CorreosIAPage