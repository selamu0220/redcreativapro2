import type { Metadata } from 'next'
import PreguntasFrecuentesClient, { faqCategories } from './FAQClient'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Red Creativa Pro',
  description: 'Encuentra respuestas rápidas a las preguntas más comunes sobre Red Creativa Pro. FAQ sobre cuenta, planes, escritor IA, correos y soporte técnico.',
  alternates: { canonical: 'https://redcreativa.pro/preguntas-frecuentes' },
  openGraph: {
    title: 'Preguntas Frecuentes | Red Creativa Pro',
    description: 'Encuentra respuestas rápidas a las preguntas más comunes sobre Red Creativa Pro.',
    type: 'website',
    url: 'https://redcreativa.pro/preguntas-frecuentes',
  },
}

// Generate FAQPage schema from all questions
function generateFAQSchema() {
  const allQuestions = faqCategories.flatMap(category =>
    category.questions.map(q => ({
      '@type': 'Question' as const,
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: q.answer
      }
    }))
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions
  }
}

// Generate BreadcrumbList schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: 'https://redcreativa.pro'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Preguntas Frecuentes',
      item: 'https://redcreativa.pro/preguntas-frecuentes'
    }
  ]
}

export default function PreguntasFrecuentesPage() {
  const faqSchema = generateFAQSchema()

  return (
    <>
      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      {/* BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <PreguntasFrecuentesClient />
    </>
  )
}
