import { Metadata } from 'next'
import { getGlossaryTermById, glossaryTerms } from '@/lib/glossary'
import Breadcrumbs from '@/app/components/Breadcrumbs'

interface TermPageProps {
  params: Promise<{ termino: string }>
}

export async function generateStaticParams() {
  return glossaryTerms.map(t => ({ termino: t.id }))
}

export async function generateMetadata({ params }: TermPageProps): Promise<Metadata> {
  const { termino } = await params
  const term = getGlossaryTermById(termino)
  if (!term) {
    return {
      title: 'Término no encontrado',
      description: 'El término solicitado no existe en el glosario.'
    }
  }
  return {
    title: `${term.term} – Glosario`,
    description: term.definition,
    openGraph: {
      title: `${term.term} – Glosario`,
      description: term.definition,
      url: `https://redcreativa.pro/glosario/${term.id}`
    },
    twitter: {
      title: `${term.term} – Glosario`,
      description: term.definition
    }
  }
}

export default async function TermPage({ params }: TermPageProps) {
  const { termino } = await params
  const term = getGlossaryTermById(termino)
  if (!term) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { href: '/glosario', label: 'Glosario' }, { label: 'No encontrado' }]} />
        <h1 className="text-2xl font-bold mb-4">Término no encontrado</h1>
        <p className="text-gray-600">El término solicitado no existe en el glosario.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { href: '/glosario', label: 'Glosario' }, { label: term.term }]} />
      <article className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-3">{term.term}</h1>
        <div className="text-sm text-gray-500 mb-4">{term.category}</div>
        <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{term.definition}</p>
        {term.related && term.related.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Relacionados</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              {term.related.map((id) => {
                const rel = getGlossaryTermById(id)
                if (!rel) return null
                return (
                  <li key={id}>
                    <a href={`/glosario/${id}`} className="text-primary hover:underline">{rel.term}</a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </article>
    </div>
  )
}

