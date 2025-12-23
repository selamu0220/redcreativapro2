import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpenCheck, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Prompts de IA para tesis en español: metodología y revisión | Red Creativa Pro',
  description: '💡 Domina colección de prompts de ia para tesis en español: objetivos ★ metodología ★ revisión de literatura ✓ discusión. ✨ ¡Paso a paso!',
  keywords: 'prompts IA tesis español, metodología tesis IA, revisión de literatura IA, discusión tesis IA',
  openGraph: {
    title: 'Prompts de IA para tesis en español: metodología y revisión | Red Creativa Pro',
    description: 'Prompts de IA para definir objetivos, metodología y revisión de literatura en español.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['tesis','metodología','revisión literatura','IA','academia'],
    images: [{
      url: 'https://redcreativa.pro/blog/prompts-ia-tesis-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Prompts de IA para tesis en español'
    }]
  },
  twitter: { card: 'summary_large_image', title: 'Prompts IA para tesis (español)', images: ['https://redcreativa.pro/blog/prompts-ia-tesis-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/prompts-ia-tesis-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Prompts de IA para tesis en español: metodología y revisión',
  description: 'Prompts de IA para tesis en español: objetivos, metodología, revisión de literatura y discusión.',
  keywords: 'prompts IA tesis español, metodología tesis IA, revisión de literatura IA, discusión tesis IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/prompts-ia-tesis-espanol' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cómo definir objetivos medibles?', acceptedAnswer: { '@type': 'Answer', text: 'Usa verbos de acción, métricas y población/variable claramente delimitada.' } },
    { '@type': 'Question', name: '¿Cómo organizar la revisión de literatura?', acceptedAnswer: { '@type': 'Answer', text: 'Agrupa por temas, año y metodología; resume hallazgos y vacíos.' } }
  ]
}

export default function PromptsTesisPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <ArticleWrapper>
        <article className="max-w-4xl mx-auto px-4 py-8">
          
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Prompts IA para tesis</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">IA en Educación</span>
            <span>•</span>
            <span>12 min de lectura</span>
            <span>•</span>
            <span>1 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Prompts de IA para tesis en español: metodología y revisión</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Define objetivos, diseña metodología y organiza la revisión de literatura con prompts prácticos en español.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <div className="flex items-start">
              <BookOpenCheck className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Estructura</h3>
                <ul className="text-blue-800 list-disc list-inside">
                  <li>Objetivos: específicos y medibles</li>
                  <li>Metodología: diseño, muestra y análisis</li>
                  <li>Revisión: temas, hallazgos, vacíos</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Prompts</h2>
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Redacta 3 objetivos medibles para una tesis sobre [tema] con población y variable.</li>
              <li>Define una metodología (diseño, muestra, instrumentos y análisis) acorde al objetivo.</li>
              <li>Organiza una revisión de literatura por temas y años con síntesis de hallazgos.</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <GraduationCap className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Recursos</h3>
                <p>Usa <Link href="/escritor-ia" className="text-blue-700 hover:text-blue-900">Escritor IA</Link> y <Link href="/corrector-textos-ia" className="text-blue-700 hover:text-blue-900">Corrector de textos IA</Link> para refinar.</p>
                <Link href="/escritor-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mt-4">
                  Empezar ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <section className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-semibold mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <a href="/blog/cold-email-ia-saas-b2b-espanol" className="text-blue-600 hover:underline">Plantillas de cold email con IA para SaaS B2B en español</a></li>
                  <li>• <a href="/blog/plantillas-postcompra-belleza-ia-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/automatizar-resumenes-reuniones-ia-notion" className="text-blue-600 hover:underline">ia para escritura</a></li>
                  <li>• <a href="/blog/desarrollo-apis-creativas-ia" className="text-blue-600 hover:underline">Desarrollo de APIs para proyectos creativos con IA</a></li>
                  <li>• <a href="/blog/plantillas-correos-ia-ecommerce-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </article>
      </ArticleWrapper>
    </>
  )
}

