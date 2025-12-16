import type { Metadata } from 'next'
import { LanguageLink } from '@/app/components/LanguageLink'
import Breadcrumbs from '@/app/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Herramientas de IA para Copywriting | Hub',
  description: 'Hub de herramientas y guías de IA para copywriting profesional. Accede a landings y artículos relacionados.',
  alternates: { canonical: 'https://redcreativa.pro/herramientas-ia-copywriting' },
  robots: { index: true, follow: true }
}

export default function HerramientasIACopywritingHub() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: 'Herramientas de IA para Copywriting' }]} />
      <h1 className="text-4xl font-bold mb-6">Herramientas de IA para Copywriting</h1>
      <p className="text-lg text-muted-foreground mb-8">Explora recursos clave para mejorar tu escritura y marketing con IA.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguageLink href="/escritor-ia" className="block border rounded-lg p-6 hover:shadow-md bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-400">Escritor IA Profesional</h2>
          <p>Genera artículos, blogs y contenido creativo con inteligencia artificial avanzada.</p>
        </LanguageLink>
        <LanguageLink href="/correos-ia" className="block border rounded-lg p-6 hover:shadow-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <h2 className="text-xl font-bold mb-2 text-green-700 dark:text-green-400">Correos IA</h2>
          <p>Redacta emails profesionales, secuencias de ventas y newsletters automáticamente.</p>
        </LanguageLink>
        <LanguageLink href="/plantilla-solicitudes-creativas" className="block border rounded-lg p-6 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Plantilla para solicitudes creativas</h2>
          <p>Descarga gratuita y guía práctica.</p>
        </LanguageLink>
        <LanguageLink href="/corrector-textos-ia" className="block border rounded-lg p-6 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Corrector de textos IA</h2>
          <p>Comparativa de herramientas y guía de uso.</p>
        </LanguageLink>
        <LanguageLink href="/prompts" className="block border rounded-lg p-6 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Prompts IA para Copywriting</h2>
          <p>Colección de plantillas para anuncios, emails, titulares y más.</p>
        </LanguageLink>
        <LanguageLink href="/blog/textos-automaticos-cuando-usarlos-cuando-no" className="block border rounded-lg p-6 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Textos automáticos: cuándo sí/no</h2>
          <p>Criterios, ejemplos y riesgos de uso.</p>
        </LanguageLink>
        <LanguageLink href="/blog/creador-redacciones-automatico-guia-ejemplos" className="block border rounded-lg p-6 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Creador de redacciones automático</h2>
          <p>Flujos, prompts y ejemplos prácticos.</p>
        </LanguageLink>
        <LanguageLink href="/blog/desarrollo-apis-creativas-ia" className="block border rounded-lg p-6 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Desarrollo de APIs IA</h2>
          <p>Integraciones y patrones para proyectos creativos.</p>
        </LanguageLink>
      </div>
    </main>
  )
}
