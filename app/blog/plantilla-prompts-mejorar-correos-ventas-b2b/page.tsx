import ArticleWrapper from "@/app/components/ArticleWrapper";
import type { Metadata } from 'next'
import ArticleTemplate from '@/components/blog/ArticleTemplate'

export const metadata: Metadata = {
  title: 'Plantilla de prompts para mejorar correos de ventas B2B',
  description: 'Plantilla lista para usar que mejora apertura y respuesta en emails de ventas B2B con IA.',
  alternates: { canonical: 'https://redcreativa.pro/blog/plantilla-prompts-mejorar-correos-ventas-b2b' },
  openGraph: { title: 'Prompts para correos B2B', description: 'Aumenta apertura y respuesta con variaciones y ejemplos.', type: 'article' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Sirve para industrias distintas?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, ajusta contexto y beneficios específicos.' }},
    { '@type': 'Question', name: '¿Cómo evitar spam?', acceptedAnswer: { '@type': 'Answer', text: 'Usa líneas claras, valor real y evita gatillos de spam.' }}
  ]
}

export default function Page() {
  return (
    <ArticleTemplate 
      title="Plantilla de prompts para mejorar correos de ventas B2B"
      description="Estructura adaptable para generar asuntos, cuerpo y CTA efectivos en B2B."
      faqJsonLd={faqJsonLd}
      relatedLinks={[
        { href: '/blog/automatizar-correos-electronicos-ia', label: 'Automatizar correos con IA' },
        { href: '/plantilla-solicitudes-creativas', label: 'Plantilla para solicitudes creativas' },
        { href: '/blog/ia-copywriting-ventas-conversion-2025', label: 'Copywriting IA para ventas 2025' }
      ]}
    >
      <h2 className="text-2xl font-semibold mb-3">Estructura de la plantilla</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Contexto del cliente y dolor</li>
        <li>Beneficio principal y prueba social</li>
        <li>CTA claro y siguiente paso</li>
        <li>Variaciones por segmento</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3">Ejemplos</h2>
      <pre className="bg-gray-100 p-4 rounded">[Industria]+[Dolor]+[Beneficio]+[Prueba]+[CTA]</pre>
      <p>Incluye ejemplos listos y ajustes por sector.</p>
    </ArticleTemplate>
  )
}

