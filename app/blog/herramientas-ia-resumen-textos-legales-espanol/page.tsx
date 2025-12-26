import ArticleWrapper from "@/app/components/ArticleWrapper";
import type { Metadata } from 'next'
import ArticleTemplate from '@/components/blog/ArticleTemplate'

export const metadata: Metadata = {
  title: 'Mejores herramientas IA para resumir textos legales en español',
  description: '💡 Domina comparativa práctica de herramientas ia para resumir documentos legales en español con precisión. ✨ ¡Paso a paso!',
  
  keywords: 'mejores, herramientas, para, resumir, textos, legales, español, herramientas, resumen, textos',alternates: { canonical: 'https://redcreativa.pro/blog/herramientas-ia-resumen-textos-legales-espanol' },
  openGraph: {
    title: 'Mejores herramientas IA para resumir textos legales en español',
    description: 'Comparativa práctica de herramientas IA para resumir documentos legales en español con precisión.',
    type: 'article'
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué herramienta funciona mejor para textos legales en español?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del caso: evalúa precisión, control de longitud y privacidad.' }},
    { '@type': 'Question', name: '¿Cómo mejorar la precisión de los resúmenes?', acceptedAnswer: { '@type': 'Answer', text: 'Usa prompts con contexto, objetivos claros y límite de palabras.' }}
  ]
}

export default function Page() {
  return (
    <ArticleTemplate 
      title="Mejores herramientas de IA para resumir textos legales en español"
      description="Comparativa práctica con criterios de evaluación y recomendaciones por caso de uso."
      faqJsonLd={faqJsonLd}
      relatedLinks={[
        { href: '/blog/herramientas-ia-escritura-2025', label: 'Herramientas IA de escritura 2025' },
        { href: '/blog/optimizar-contenido-seo-ia', label: 'Optimizar contenido SEO con IA' },
        { href: '/blog/workflows-automatizacion-escritura-ia', label: 'Workflows de automatización con IA' }
      ]}
    >
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Mejores herramientas IA para resumir textos
        </h1>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Mejores herramientas IA para resumir textos
        </h1>
      <h2 className="text-2xl font-semibold mb-3">Criterios de evaluación</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Precisión y cobertura semántica</li>
        <li>Control de longitud y formato</li>
        <li>Privacidad y cumplimiento</li>
        <li>Coste y límites</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3">Flujo recomendado</h2>
      <ol className="list-decimal pl-6 mb-6">
        <li>Definir objetivo y extensión</li>
        <li>Crear prompt con contexto legal</li>
        <li>Validar y ajustar con ejemplos</li>
        <li>Exportar a Notion o documento</li>
      </ol>
      <p>Incluye ejemplos y plantillas accionables para iniciar rápido.</p>
    </ArticleTemplate>
  )
}
