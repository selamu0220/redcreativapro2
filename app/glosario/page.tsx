import Link from 'next/link'
import { glossaryTerms } from '@/lib/glossary'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Glosario SEO e IA: Términos Clave para Marketing Digital 2026',
  description:
    '📚 Glosario SEO completo: definiciones claras de IA, posicionamiento web y productividad. +50 términos explicados para principiantes y expertos.',
  keywords: ['glosario seo', 'términos seo', 'diccionario ia', 'vocabulario marketing digital'],
  alternates: {
    canonical: 'https://redcreativa.pro/glosario',
  },
  openGraph: {
    title: 'Glosario SEO e IA: Términos Clave 2026',
    description: 'Diccionario completo de SEO, IA y productividad. +50 definiciones claras.',
    type: 'website',
  }
}

export default function GlosarioIndexPage() {
  const items = glossaryTerms
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: 'Glosario' }]} />
      <h1 className="text-3xl font-bold mb-6">Glosario</h1>
      <p className="text-gray-600 mb-6">
        Conceptos fundamentales para entender y aplicar IA, SEO y productividad.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t) => (
          <Link
            key={t.id}
            href={`/glosario/${t.id}`}
            className="block p-4 border rounded-lg hover:border-primary transition-colors"
          >
            <div className="text-xs text-gray-500 mb-1">{t.category}</div>
            <h2 className="text-lg font-semibold">{t.term}</h2>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{t.definition}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

