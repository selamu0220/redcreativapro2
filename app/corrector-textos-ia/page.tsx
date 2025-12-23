import type { Metadata } from 'next'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import CTATrackedLink from '@/app/components/CTATrackedLink'
import ShareBar from '@/app/components/ShareBar'
import { ProtectedRoute } from '@/app/components/ProtectedRoute'
import { SimpleMainNavigation } from '../components/SimpleMainNavigation'
import Footer from '../components/Footer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CheckCircle2, BookOpen, Lightbulb, HelpCircle, ArrowRight } from 'lucide-react'

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
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <SimpleMainNavigation />
        
        <main className="flex-grow container mx-auto px-4 py-24 max-w-4xl">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
          
          <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { href: '/herramientas-ia-copywriting', label: 'Herramientas IA' }, { label: 'Corrector de textos IA' }]} />
          
          <div className="mt-8 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Corrector de textos IA</h1>
            <p className="text-xl text-muted-foreground">Guía práctica con comparativa de herramientas, ejemplos y buenas prácticas para escritores.</p>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Comparativa de herramientas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Herramienta A</CardTitle>
                    <CardDescription>Ideal para gramática técnica y ortografía avanzada.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Herramienta B</CardTitle>
                    <CardDescription>Enfocada en marketing y tono persuasivo.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Herramienta C</CardTitle>
                    <CardDescription>Perfecta para reescritura creativa y fluidez.</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Guía paso a paso</h2>
              </div>
              <div className="space-y-4">
                {[
                  "Define el objetivo y el tono deseado",
                  "Elige la herramienta adecuada para tu caso",
                  "Aplica reglas y revisa los cambios sugeridos"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-lg font-medium pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Card className="border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-white dark:text-black">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">¿Listo para mejorar tus textos?</h3>
                      <p className="opacity-80">Prueba nuestro escritor con IA integrada y lleva tu copywriting al siguiente nivel.</p>
                    </div>
                    <Button variant="outline" className="shrink-0 bg-transparent border-current hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white" asChild>
                      <Link href="/escritor-ia">
                        Probar Escritor IA <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-2">¿Qué corrector IA elegir?</h3>
                  <p className="text-muted-foreground">Prioriza según tu objetivo específico (gramática, estilo o tono) y valida siempre con muestras reales de tu contenido.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">¿Cómo evitar sobrecorrección?</h3>
                  <p className="text-muted-foreground">Define reglas de estilo claras de antemano, conserva tu voz de marca original y compara siempre las versiones antes y después.</p>
                </div>
              </div>
            </section>
            
            <div className="pt-12 border-t">
              <ShareBar url="https://redcreativa.pro/corrector-textos-ia" title="Corrector de textos IA: guía y comparativa" />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
