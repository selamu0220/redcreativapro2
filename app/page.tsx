import HomePageClient from './components/HomePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Red Creativa Pro | Escritor IA Gratis en Español - SEO Automático',
  description:
    'Escribe 3x más rápido con IA que aprende tu estilo. Escritor con inteligencia artificial, SEO automático, corrector de textos y generador de contenido. Herramienta de copywriting IA para periodistas y creadores.',
  keywords: ['escritor ia', 'escritor inteligencia artificial', 'redactor ia', 'copywriting ia', 'herramienta escritura ia', 'seo automatico', 'generador contenido ia', 'red creativa'],
  alternates: { canonical: 'https://www.redcreativa.pro/' },
  openGraph: {
    title: 'Red Creativa Pro | Escritor IA Gratis - Escribe 3x Más Rápido',
    description: 'Herramienta de escritura con IA que aprende tu estilo. SEO automático y corrección de textos para periodistas y creadores de contenido.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

// Disable layout header for home page by wrapping in a custom layout
export default function HomePage() {
  // WebSite schema for sitelinks search box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Red Creativa Pro',
    url: 'https://www.redcreativa.pro',
    description: 'Herramienta de escritura con IA para periodistas y creadores de contenido en español',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.redcreativa.pro/buscar?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://www.redcreativa.pro'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <HomePageClient />
    </div>
  )
}
