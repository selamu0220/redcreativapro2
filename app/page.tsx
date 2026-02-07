import HomePageClient from './components/HomePageClient'
import type { Metadata } from 'next'
import { FAQSection } from './components/seo/FAQSection'
import { SchemaJSONLD } from '@/lib/seo/SchemaJSONLD'

export const metadata: Metadata = {
  title: 'Red Creativa Pro | Escritor IA Gratis en Español - SEO Automático',
  description:
    'Escribe 3x más rápido con IA que aprende tu estilo. Escritor con inteligencia artificial, SEO automático, corrector de textos y generador de contenido. Herramienta de copywriting IA para periodistas y creadores.',
  keywords: ['escritor ia', 'escritor inteligencia artificial', 'redactor ia', 'copywriting ia', 'herramienta escritura ia', 'seo automatico', 'generador contenido ia', 'red creativa'],
  alternates: { canonical: 'https://redcreativa.pro/' },
  openGraph: {
    title: 'Red Creativa Pro | Escritor IA Gratis - Escribe 3x Más Rápido',
    description: 'Herramienta de escritura con IA que aprende tu estilo. SEO automático y corrección de textos para periodistas y creadores de contenido.',
    type: 'website',
    url: 'https://redcreativa.pro',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Red+Creativa+Pro', width: 1200, height: 630, alt: 'Red Creativa Pro - Escritor IA' }],
  },
  twitter: { 
    card: 'summary_large_image',
    title: 'Red Creativa Pro | Escritor IA Gratis - SEO Automático',
    description: 'Escribe 3x más rápido con IA. Herramienta de copywriting para periodistas y creadores.'
  },
  robots: { index: true, follow: true },
}

// Disable layout header for home page by wrapping in a custom layout
export default function HomePage() {
  // WebSite schema for sitelinks search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Red Creativa Pro',
    url: 'https://redcreativa.pro',
    description: 'Herramienta de escritura con IA para periodistas y creadores de contenido en español',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://redcreativa.pro/buscar?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://redcreativa.pro'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SchemaJSONLD json={websiteSchema} />
      <HomePageClient />

      <FAQSection
        title="Preguntas Frecuentes sobre IA en Periodismo"
        description="Resolvemos las dudas más comunes sobre el uso de Inteligencia Artificial en redacciones y medios."
        items={[
          {
            question: "¿La IA reemplazará a los periodistas?",
            answer: "No. La IA es una herramienta de asistencia, no un reemplazo. Red Creativa Pro está diseñada para potenciar tu creatividad, automatizar tareas repetitivas (como transcripciones o SEO) y permitirte enfocar en la investigación y el análisis humano, que son irreemplazables."
          },
          {
            question: "¿Qué herramientas de IA son mejores para periodistas en 2025?",
            answer: "Para 2025, las herramientas esenciales incluyen Red Creativa Pro (para redacción y SEO ético), herramientas de verificación de datos (Fact-checking), y sistemas de transcripción automática. Nuestra plataforma integra escritura, corrección de estilo y optimización SEO en un solo lugar."
          },
          {
            question: "¿Es seguro usar IA para escribir noticias?",
            answer: "Sí, siempre que se use con supervisión humana. Red Creativa Pro incluye funciones de 'Stealth Mode' para humanizar textos y evitar la detección robótica, asegurando que tus noticias mantengan un tono periodístico auténtico y profesional."
          },
          {
            question: "¿Ayuda esta herramienta a mejorar el SEO de mis artículos?",
            answer: "Absolutamente. Nuestra IA analiza tu texto en tiempo real y sugiere palabras clave, estructura de encabezados (H1, H2) y meta descripciones optimizadas para Google, aumentando significativamente la visibilidad de tus artículos."
          }
        ]}
      />
    </div>
  )
}
