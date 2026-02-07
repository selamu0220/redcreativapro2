import type { Metadata } from 'next'
import { HeadlineGeneratorClient } from './client'

export const metadata: Metadata = {
  title: 'Generador de Headlines SEO | Títulos que Clickean | Gratis',
  description: 'Genera headlines irresistibles y optimizados para SEO. Mejora tu CTR con títulos persuasivos. Herramienta gratuita de Red Creativa Pro.',
  keywords: ['generador headlines', 'generador titulos seo', 'headlines persuasivos', 'titulos ctr'],
  alternates: { canonical: 'https://redcreativa.pro/herramientas/generador-headlines' }
}

export default function HeadlineGeneratorPage() {
  return <HeadlineGeneratorClient />
}
