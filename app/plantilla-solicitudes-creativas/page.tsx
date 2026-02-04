import type { Metadata } from 'next'
import PlantillaSolicitudesClient from './client'

export const metadata: Metadata = {
  title: 'Plantilla para Solicitudes Creativas Gratis 2026 [Descarga PDF]',
  description: '✅ Plantilla para solicitudes creativas GRATIS. Descarga el formato profesional que usan +500 agencias. Brief creativo + checklist + ejemplos reales.',
  keywords: ['plantilla para solicitudes creativas', 'plantilla solicitudes creativas', 'brief creativo', 'plantilla brief', 'solicitud creativa', 'template brief gratis'],
  openGraph: {
    title: 'Plantilla para Solicitudes Creativas Gratis 2026',
    description: 'La plantilla definitiva para crear solicitudes creativas que consiguen resultados. Descarga gratis + guía completa + checklist.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-plantilla-solicitudes.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plantilla para Solicitudes Creativas Gratis 2026',
    description: '✅ Descarga la plantilla que usan +500 agencias. Brief + checklist + ejemplos.',
    images: ['https://redcreativa.pro/og-plantilla-solicitudes.jpg']
  },
  alternates: {
    canonical: 'https://redcreativa.pro/plantilla-solicitudes-creativas'
  },
  robots: { index: true, follow: true }
}

export default function PlantillaSolicitudesCreativasPage() {
  return <PlantillaSolicitudesClient />
}
