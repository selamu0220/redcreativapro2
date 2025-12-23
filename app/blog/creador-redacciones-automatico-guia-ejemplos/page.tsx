import ArticleWrapper from "@/app/components/ArticleWrapper";
import type { Metadata } from 'next'
import ArticleTemplate from '@/app/components/blog/ArticleTemplate'

export const metadata: Metadata = {
  title: 'Creador de redacciones automático: guía y ejemplos',
  description: '💡 Descubre cómo usar un creador automático de redacciones con ia: flujo ★ prompts ✓ ejemplos antes/después. ✨ ¡Paso a paso!',
  
  keywords: 'creador, redacciones, automático:, guía, ejemplos, creador, redacciones, automatico, guia, ejemplos',
  alternates: { canonical: 'https://redcreativa.pro/blog/creador-redacciones-automatico-guia-ejemplos' },
  openGraph: {
    title: 'Creador de redacciones automático: guía y ejemplos',
    description: 'Flujos, prompts y ejemplos para dominar la generación automática de textos.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-creador-redacciones.jpg', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es un creador de redacciones automático?', acceptedAnswer: { '@type': 'Answer', text: 'Una herramienta IA que genera textos según objetivos y prompts.' }},
    { '@type': 'Question', name: '¿Cómo garantizar calidad?', acceptedAnswer: { '@type': 'Answer', text: 'Brief claro, prompts estructurados, revisión humana y métricas.' }}
  ]
}

export default function Page() {
  return (
    <ArticleTemplate title="Creador de redacciones automático: guía y ejemplos" description="Domina prompts y workflows con ejemplos prácticos." faqJsonLd={faqJsonLd} relatedLinks={[
      { href: '/blog/textos-automaticos-cuando-usarlos-cuando-no', label: 'Textos automáticos: cuándo sí/no' },
      { href: '/herramientas-ia-copywriting', label: 'Hub de herramientas IA' },
      { href: '/plantilla-solicitudes-creativas', label: 'Plantilla de solicitudes creativas' }
    ]}>
      <h2 className="text-2xl font-semibold mb-3">Flujo recomendado</h2>
      <ol className="list-decimal pl-6 mb-6">
        <li>Definir objetivos y audiencia</li>
        <li>Preparar brief y datos</li>
        <li>Generar variaciones y seleccionar</li>
        <li>Editar y optimizar SEO</li>
      </ol>
      <h2 className="text-2xl font-semibold mb-3">Prompts efectivos</h2>
      <pre className="bg-gray-100 p-4 rounded">[CONTEXTO]+[AUDIENCIA]+[OBJETIVO]+[FORMATO]+[TONO]+[RESTRICCIONES]</pre>
      <h2 className="text-2xl font-semibold mb-3">Ejemplos antes/después</h2>
      <p>Demuestra claridad, estructura y persuasión tras aplicar el flujo y prompts.</p>
    </ArticleTemplate>
  )
}
