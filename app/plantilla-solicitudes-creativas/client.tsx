'use client'

import { useState } from 'react'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import ShareBar from '@/app/components/ShareBar'

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué incluye la plantilla?',
      acceptedAnswer: { '@type': 'Answer', text: 'Estructura de brief, ejemplos y checklist de validación.' }
    },
    {
      '@type': 'Question',
      name: '¿Es realmente gratuita?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí, puedes descargarla sin registrarte.' }
    }
  ]
}

export default function PlantillaSolicitudesClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setError(null)
    if (!email) {
      setError('Ingresa tu email para descargar')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/lead-magnets/download/plantilla-solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' })
      })
      const data = await res.json()
      if (data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl
      } else {
        setError(data.error || 'No se pudo iniciar la descarga')
      }
    } catch (e) {
      setError('Error de conexión. Inténtalo de nuevo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { href: '/herramientas-ia-copywriting', label: 'Herramientas IA' }, { label: 'Plantilla para solicitudes creativas' }]} />
      <h1 className="text-4xl font-bold mb-4">Plantilla para solicitudes creativas</h1>
      <p className="text-lg text-muted-foreground mb-6">Descarga gratuita para mejorar tus briefs y resultados creativos.</p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="w-full sm:w-auto flex-1 border rounded-lg px-4 py-2"
        />
        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Procesando…' : 'Descargar gratis'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-2">Qué incluye</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Estructura de brief con campos clave</li>
            <li>Ejemplos de buenas prácticas</li>
            <li>Checklist de validación</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Cómo usarla</h2>
          <p>Completa los campos con información concreta, añade objetivos y criterios de éxito, comparte con tu equipo.</p>
        </section>
        <ShareBar url="https://redcreativa.pro/plantilla-solicitudes-creativas" title="Plantilla para solicitudes creativas (descarga gratuita)" />
      </div>
    </main>
  )
}