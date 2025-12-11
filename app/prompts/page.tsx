import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import { promptPages } from '@/lib/prompts-data'

export const metadata: Metadata = {
  title: 'Prompts IA para Copywriting | Plantillas listas para usar',
  description: 'Colección de prompts IA para copywriting profesional: anuncios, emails, descripciones, titulares, LinkedIn, X/Twitter, SEO y más.',
  alternates: { canonical: 'https://redcreativa.pro/prompts' },
  robots: { index: true, follow: true }
}

export default function PromptsIndexPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: 'Prompts IA' }]} />
      <h1 className="text-4xl font-bold mb-4">Prompts IA para Copywriting</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Plantillas y estructuras probadas para generar textos que posicionan y convierten.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promptPages.map((p) => (
          <Link key={p.slug} href={`/prompts/${p.slug}`} className="block border rounded-lg p-6 hover:shadow-md">
            <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
            <p>{p.seoDescription ?? p.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}

