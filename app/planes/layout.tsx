import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planes y Precios | Red Creativa Pro',
  description: 'Elige el plan perfecto para ti. Desde gratis hasta ilimitado. Red Creativa Pro te ayuda a escribir mejor y más rápido con IA.',
  keywords: ['planes Red Creativa Pro', 'precio escritor IA', 'suscripción IA', 'herramienta escritura precio'],
  alternates: {
    canonical: 'https://redcreativa.pro/planes'
  },
  openGraph: {
    title: 'Planes y Precios | Red Creativa Pro',
    description: 'Elige el plan perfecto para ti. Desde gratis hasta ilimitado.',
    type: 'website',
    url: 'https://redcreativa.pro/planes',
  },
}

export default function PlanesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
