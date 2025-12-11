import type { Metadata } from 'next'
import PlantillaSolicitudesClient from './client'

export const metadata: Metadata = {
  title: 'Plantilla para solicitudes creativas (descarga gratuita) | Red Creativa Pro',
  description: 'Mejora briefs y resultados con una plantilla gratuita para solicitudes creativas. Incluye guía práctica y ejemplos.',
  openGraph: {
    title: 'Plantilla para solicitudes creativas (descarga gratuita)',
    description: 'Plantilla gratuita para briefs creativos con guía y ejemplos.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-plantilla-solicitudes.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plantilla para solicitudes creativas (descarga gratuita)',
    description: 'Mejora briefs y resultados con una plantilla gratuita.',
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
