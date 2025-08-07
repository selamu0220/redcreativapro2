'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EmailCollectionPageData } from '../../lib/database'
import QualificationForm from '../../components/QualificationForm'

export default function EmailCollectionPage() {
  const params = useParams()
  const pageId = params.pageId as string
  
  const [pageData, setPageData] = useState<EmailCollectionPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    customFields: {} as Record<string, string>
  })
  
  const [showQualificationForm, setShowQualificationForm] = useState(false)
  const [qualificationResponses, setQualificationResponses] = useState<any[]>([])

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await fetch(`/api/email-pages/${pageId}`)
        if (response.ok) {
          const data = await response.json()
          setPageData(data.page)
        } else {
          setError('Página no encontrada')
        }
      } catch (error) {
        console.error('Error fetching page:', error)
        setError('Error al cargar la página')
      } finally {
        setLoading(false)
      }
    }

    if (pageId) {
      fetchPageData()
    }
  }, [pageId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          email: formData.email,
          name: formData.name,
          customFields: formData.customFields
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Si hay cuestionario habilitado, mostrarlo antes de marcar como completado
        if (pageData?.qualificationForm?.enabled && pageData.qualificationForm.questions.length > 0) {
          setShowQualificationForm(true)
        } else {
          setSubmitted(true)
        }
      } else {
        setError(data.error || 'Error al suscribirse')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión. Por favor intenta más tarde.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email' || field === 'name') {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        customFields: { ...prev.customFields, [field]: value }
      }))
    }
  }

  const handleQualificationComplete = async (responses: any[]) => {
    setQualificationResponses(responses)
    
    // Enviar respuestas del cuestionario al servidor
    try {
      await fetch('/api/qualification-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          email: formData.email,
          responses
        }),
      })
    } catch (error) {
      console.error('Error saving qualification responses:', error)
    }
    
    setShowQualificationForm(false)
    setSubmitted(true)
  }

  const handleQualificationSkip = () => {
    setShowQualificationForm(false)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error && !pageData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-zinc-300 mb-6">{error}</p>
            <Link 
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!pageData?.isActive) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-yellow-400 mb-4">Página no disponible</h1>
            <p className="text-zinc-300 mb-6">Esta página de suscripción no está activa actualmente.</p>
            <Link 
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar cuestionario de cualificación si está habilitado
  if (showQualificationForm && pageData?.qualificationForm) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <QualificationForm
          config={pageData.qualificationForm}
          userName={formData.name || 'Usuario'}
          onComplete={handleQualificationComplete}
          onSkip={handleQualificationSkip}
        />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">¡Suscripción exitosa!</h1>
            <p className="text-zinc-300 mb-6">{pageData.successMessage}</p>
            <Link 
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">RC</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4 text-center">{pageData.title}</h1>
          <p className="text-zinc-300 mb-6 text-center">{pageData.description}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
              />
            </div>

            {/* Name field (if enabled) */}
            {pageData.collectName && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                />
              </div>
            )}

            {/* Custom fields */}
            {pageData.customFields?.map((field, index) => (
              field && field.name ? (
                <div key={index}>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {field.name} {field.required && '*'}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={formData.customFields[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={`Ingresa tu ${field.name?.toLowerCase() || 'información'}`}
                    required={field.required}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>
              ) : null
            ))}

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Suscribiendo...' : pageData.buttonText}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-xs">
              Powered by{' '}
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                Red Creativa Pro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}