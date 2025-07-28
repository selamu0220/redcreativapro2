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
        headers: { 'Content-Type': 'application/json' },
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
                <h1 className="text-lg font-semibold text-gray-900">Correos IA</h1>
              </div>
              <div className="flex items-center space-x-4">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de configuración */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Configuración del Email</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destinatario *
                    </label>
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="destinatario@email.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Asunto del email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Propósito del Email *
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona el propósito...</option>
                      {emailPurposes.map((purposeOption, index) => (
                        <option key={index} value={purposeOption}>
                          {purposeOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contexto Adicional
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Proporciona contexto adicional, detalles específicos, tono deseado, etc."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={generateEmail}
                    disabled={!recipient || !subject || !purpose || isGenerating}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Email'}
                  </button>
                  <button
                    onClick={clearForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de vista previa */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Vista Previa del Email</h2>
                  {generatedEmail && (
                    <div className="flex space-x-2">
                      <button
                        onClick={copyToClipboard}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                      >
                        Copiar
                      </button>
                      <button
                        onClick={sendEmail}
                        disabled={isSending}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                      >
                        {isSending ? 'Enviando...' : 'Enviar Email'}
                      </button>
                      <button
                        onClick={() => setShowGmailScript(!showGmailScript)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
                      >
                        Gmail Script
                      </button>
                    </div>
                  )}
                </div>
                
                {recipient && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <strong>Para:</strong> {recipient}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Asunto:</strong> {subject}
                    </div>
                  </div>
                )}

                <div className="min-h-96 p-4 border border-gray-300 rounded-lg bg-white">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Generando email...</span>
                    </div>
                  ) : generatedEmail ? (
                    <div className="whitespace-pre-wrap text-gray-800">
                      {generatedEmail}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic flex items-center justify-center h-96">
                      El email generado aparecerá aquí...
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de Gmail Apps Script */}
              {showGmailScript && generatedEmail && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Gmail Apps Script</h3>
                    <button
                      onClick={downloadGmailScript}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Descargar .gs
                    </button>
                  </div>
                  
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Instrucciones:</h4>
                    <ol className="text-sm text-yellow-700 space-y-1">
                      <li>1. Ve a script.google.com</li>
                      <li>2. Crea un nuevo proyecto</li>
                      <li>3. Pega el código generado</li>
                      <li>4. Guarda y ejecuta la función</li>
                    </ol>
                  </div>
                  
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{gmailAppsScript}</code>
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