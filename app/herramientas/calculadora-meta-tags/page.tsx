import type { Metadata } from 'next'
import { MetadataCalculatorClient } from './client'

export const metadata: Metadata = {
  title: 'Calculadora SEO Meta Tags | Gratis | Red Creativa Pro',
  description: 'Calcula la longitud perfecta para tus meta titles y descriptions. Optimiza para Google y mejora tu CTR. Herramienta gratuita.',
  keywords: ['calculadora meta tags', 'longitud meta title', 'meta description caracteres', 'herramienta seo gratis'],
  alternates: { canonical: 'https://redcreativa.pro/herramientas/calculadora-meta-tags' }
}

export default function MetaCalculatorPage() {
  return <MetadataCalculatorClient />
}
