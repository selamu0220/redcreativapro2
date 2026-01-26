import type { Metadata } from 'next'
import ArticleTemplate from '@/app/components/blog/ArticleTemplate'

export const metadata: Metadata = {
  title: 'Automatiza resúmenes de reuniones con IA y Notion [Paso a paso]',
  description: 'Convierte reuniones en resúmenes accionables con IA y Notion, plantilla de prompts incluida.',
  alternates: { canonical: 'https://redcreativa.pro/blog/automatizar-resumenes-reuniones-ia-notion' },
  openGraph: { title: 'Automatiza resúmenes de reuniones con IA y Notion [Paso a paso]', description: 'Convierte reuniones en resúmenes accionables con IA y Notion, plantilla de prompts incluida.', type: 'article' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Necesito herramientas de pago?', acceptedAnswer: { '@type': 'Answer', text: 'Puedes empezar con opciones gratuitas y ampliar luego.' }},
    { '@type': 'Question', name: '¿Cómo mantener la privacidad?', acceptedAnswer: { '@type': 'Answer', text: 'Evita datos sensibles y usa repositorios seguros.' }}
  ]
}

export default function Page() {
  return (
    <ArticleTemplate 
      title="Cómo automatizar resúmenes de reuniones con IA y Notion"
      description="Workflow reproducible para generar resúmenes útiles y centralizarlos en Notion."
      faqJsonLd={faqJsonLd}
      relatedLinks={[
        { href: '/blog/workflows-automatizacion-escritura-ia', label: 'Automatización de Escritura con IA' },
        { href: '/blog/optimizar-contenido-seo-ia-2025', label: 'Optimizar contenido con IA (2025)' },
        { href: '/blog/mejorar-textos-ventas-ia-paso-a-paso', label: 'Mejorar textos de ventas con IA (paso a paso)' }
      ]}
    >
      <h2 className="text-2xl font-semibold mb-3">Arquitectura del workflow</h2>
      <ol className="list-decimal pl-6 mb-6">
        <li>Captura de audio/video de reunión</li>
        <li>Transcripción y limpieza</li>
        <li>Resumen con prompt específico</li>
        <li>Publicación automática en Notion</li>
      </ol>
      <h2 className="text-2xl font-semibold mb-3">Plantillas de prompts</h2>
      <pre className="bg-gray-100 p-4 rounded">[Contexto]+[Objetivos]+[Acciones]+[Formato]+[Longitud]</pre>
      <p>Incluye ejemplos y verificación de calidad para cada paso.</p>
    </ArticleTemplate>
  )
}
