import type { Metadata } from 'next'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import CTATrackedLink from '@/app/components/CTATrackedLink'
import ShareBar from '@/app/components/ShareBar'

export const metadata: Metadata = {
  title: 'Corrector de textos IA: guía práctica y comparativa | Red Creativa Pro',
  description: 'Aprende a corregir texto con IA en minutos. Comparativa de herramientas, guía y buenas prácticas.',
  openGraph: {
    title: 'Corrector de textos IA: guía y comparativa',
    description: 'Guía práctica, ejemplos y comparación de herramientas de corrección con IA.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-corrector-ia.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corrector de textos IA: guía y comparativa',
    description: 'Aprende a corregir texto con IA en minutos.',
    images: ['https://redcreativa.pro/og-corrector-ia.jpg']
  },
  alternates: {
    canonical: 'https://redcreativa.pro/corrector-textos-ia'
  },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Corrector de textos IA: guía práctica y comparativa',
  description: 'Guía para corregir texto con IA, herramientas y buenas prácticas.',
  datePublished: new Date().toISOString(),
  inLanguage: 'es-ES'
}
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué corrector IA elegir?', acceptedAnswer: { '@type': 'Answer', text: 'Elige según objetivo: gramática, estilo o tono; prueba comparativas.' }},
    { '@type': 'Question', name: '¿Cómo evitar sobrecorrección?', acceptedAnswer: { '@type': 'Answer', text: 'Define reglas claras, conserva voz de marca y revisa antes/después.' }}
  ]
}

export default function CorrectorTextosIAPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { href: '/herramientas-ia-copywriting', label: 'Herramientas IA' }, { label: 'Corrector de textos IA' }]} />
      <h1 className="text-4xl font-bold mb-4">Corrector de textos IA</h1>
      <p className="text-lg text-muted-foreground mb-6">Guía práctica con comparativa de herramientas y ejemplos.</p>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-2">Comparativa de herramientas</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Herramienta A: fortalezas y debilidades</li>
            <li>Herramienta B: casos de uso recomendados</li>
            <li>Herramienta C: mejor para estilo y tono</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Guía paso a paso</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Define el objetivo y el tono deseado</li>
            <li>Elige la herramienta adecuada</li>
            <li>Aplica reglas y revisa antes/después</li>
          </ol>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Buenas prácticas</h2>
          <p>Evita sobrecorrección, conserva estilo propio y valida con ejemplos reales.</p>
          <div className="mt-4">
            <CTATrackedLink
              href="/escritor-ia?utm_source=site&utm_medium=article&utm_campaign=corrector-ia"
              buttonText="Probar Escritor IA"
              buttonLocation="corrector-textos-ia"
              conversionProps={{ page: 'corrector-textos-ia' }}
            />
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">FAQ</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">¿Qué corrector IA elegir?</h3>
              <p>Prioriza según objetivo (gramática, estilo, tono) y valida con muestras.</p>
            </div>
            <div>
              <h3 className="font-medium">¿Cómo evitar sobrecorrección?</h3>
              <p>Define reglas de estilo, conserva voz de marca y compara antes/después.</p>
            </div>
          </div>
        </section>
        <ShareBar url="https://redcreativa.pro/corrector-textos-ia" title="Corrector de textos IA: guía y comparativa" />
      </div>
    </main>
  )
}
