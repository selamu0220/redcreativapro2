import Link from 'next/link'
import { glossaryTerms } from '@/lib/glossary'
import Breadcrumbs from '@/app/components/Breadcrumbs'

export const metadata = {
  title: 'Glosario de IA, SEO y Productividad',
  description:
    'Definiciones claras de términos clave en IA, SEO y productividad para reforzar autoridad temática.'
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

