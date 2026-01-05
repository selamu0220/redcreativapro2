import HomePageClient from './components/HomePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Red Creativa Pro | IA de Escritura para Periodistas',
  description:
    'Escribe 3x más rápido con IA que aprende tu estilo. SEO automático y detección reducida. Asistente de escritura para periodistas que saben escribir.',
  alternates: { canonical: 'https://redcreativa.pro/' },
  openGraph: {
    title: 'Red Creativa Pro | IA Para Periodistas que Saben Escribir',
    description: 'Escribe más rápido sin perder tu voz. IA que asiste, no reemplaza.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

// Disable layout header for home page by wrapping in a custom layout
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomePageClient />
    </div>
  )
}
