import type { Metadata } from 'next'
import PlantillaSolicitudesClient from './client'

export const metadata: Metadata = {
  title: 'Plantilla Brief Creativo Gratis 2026 [Descarga + Guía]',
  description: '✅ Descarga GRATIS la plantilla que usan +500 agencias. Brief creativo profesional + checklist + ejemplos reales. ¡Evita errores comunes!',
  keywords: ['plantilla solicitudes creativas', 'brief creativo', 'plantilla brief', 'solicitud creativa', 'template brief gratis', 'brief creativo gratis'],
  openGraph: {
    title: 'Plantilla Brief Creativo Gratis 2026 [Descarga]',
    description: 'La plantilla definitiva para crear briefs creativos que consiguen resultados. Descarga gratis + guía completa + checklist.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-plantilla-solicitudes.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plantilla Brief Creativo Gratis 2026',
    description: '✅ Descarga la plantilla que usan +500 agencias. Brief + checklist + ejemplos.',
    images: ['https://redcreativa.pro/og-plantilla-solicitudes.jpg']
  },
  alternates: {
    canonical: 'https://www.redcreativa.pro/plantilla-solicitudes-creativas'
  },
  robots: { index: true, follow: true }
}

export default function PlantillaSolicitudesCreativasPage() {
  return <PlantillaSolicitudesClient />
}
