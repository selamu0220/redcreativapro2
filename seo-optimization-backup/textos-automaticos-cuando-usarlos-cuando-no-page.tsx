import type { Metadata } from 'next'
import ArticleTemplate from '@/app/components/blog/ArticleTemplate'

export const metadata: Metadata = {
  title: 'Textos automáticos: cuándo usarlos y cuándo no',
  description: 'Guía práctica para decidir cuándo los textos automáticos aportan valor y cuándo es mejor escribir manualmente.',
  alternates: { canonical: 'https://redcreativa.pro/blog/textos-automaticos-cuando-usarlos-cuando-no' },
  openGraph: {
    title: 'Textos automáticos: cuándo sí y cuándo no',
    description: 'Criterios, ejemplos y riesgos de los textos automáticos con IA.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-textos-automaticos.jpg', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuándo usar textos automáticos?', acceptedAnswer: { '@type': 'Answer', text: 'Tareas informativas repetitivas, descripciones y resúmenes.' }},
    { '@type': 'Question', name: '¿Cuándo evitar textos automáticos?', acceptedAnswer: { '@type': 'Answer', text: 'Contenido crítico de marca, argumentación compleja y piezas creativas clave.' }}
  ]
}

export default function Page() {
  return (
    <ArticleTemplate title="Textos automáticos: cuándo usarlos y cuándo no" description="Criterios, ejemplos y riesgos para decidir con rigor." faqJsonLd={faqJsonLd} relatedLinks={[
      { href: '/blog/creador-redacciones-automatico-guia-ejemplos', label: 'Creador de redacciones automático' },
      { href: '/corrector-textos-ia', label: 'Corrector de textos IA' },
      { href: '/herramientas-ia-copywriting', label: 'Hub de herramientas IA' }
    ]}>
      <h2 className="text-2xl font-semibold mb-3">Cuándo sí</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Descripciones de catálogo y fichas técnicas</li>
        <li>Resúmenes y transcripciones</li>
        <li>Variaciones de copy para testing</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3">Cuándo no</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Mensajes de posicionamiento y tono de marca</li>
        <li>Argumentación de alto riesgo (legal, médico, financiero)</li>
        <li>Piezas creativas clave y narrativa original</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3">Buenas prácticas</h2>
      <p>Define criterios de uso, añade revisión humana y mide resultados para iterar.</p>
    </ArticleTemplate>
  )
}
