import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, TrendingUp, Settings, Target, Bot, ArrowRight, Star, Clock, Users, Award, Lightbulb, BarChart3 } from 'lucide-react'
import ArticleLayout from '@/app/components/blog/ArticleLayout';


export const metadata: Metadata = {
  title: 'Estructura IMRyD con IA para papers universitarios (español) | Red Creativa Pro',
  description: '💡 Descubre redacta introducción ★ métodos ★ resultados ✓ discusión con ia en español siguiendo imryd. ✨ ¡Paso a paso!',
  keywords: 'IMRyD IA español, estructura paper universitario IA, redactar métodos IA español',
  openGraph: {
    title: 'Estructura IMRyD con IA para papers universitarios (español) | Red Creativa Pro',
    description: 'Cómo redactar Introducción, Métodos, Resultados y Discusión con IA en español siguiendo IMRyD.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['IMRyD','papers','IA','universidad','metodología'],
    images: [{ url: 'https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol/og-image.jpg', width: 1200, height: 630, alt: 'Estructura IMRyD con IA' }]
  },
  twitter: { card: 'summary_large_image', title: 'IMRyD con IA (español)', images: ['https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol' },
  robots: { index: true, follow: true }
}



export default function ArticlePage() {
  const meta = {
      title: 'Estructura IMRyD con IA para papers universitarios (español) | Red Creativa Pro',
      description: '💡 Descubre redacta introducción ★ métodos ★ resultados ✓ discusión con ia en español siguiendo imryd. ✨ ¡Paso a paso!',
      category: 'Artículos',
      author: {
          name: 'Selamu',
          role: 'Editor',
          avatar: 'https://github.com/shadcn.png'
      },
      date: '2025-01-01', // Fallback date
      readTime: '10 min',
      image: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=4000&auto=format&fit=crop'
  };

  return (
    <>
      
      
      <ArticleLayout meta={meta}>
        {/* Extracted Content: Start */}
        
          
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">IMRyD con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <ListOrdered className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Secciones IMRyD</h3>
                <ul className="list-disc list-inside">
                  <li>Introducción: contexto y objetivos</li>
                  <li>Métodos: diseño, muestra, instrumentos y análisis</li>
                  <li>Resultados: hallazgos y tablas/figuras</li>
                  <li>Discusión: interpretación, limitaciones y futuro</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Redacta una Introducción con contexto y objetivos claros.</li>
              <li>Escribe Métodos con diseño, muestra, instrumentos y análisis.</li>
              <li>Resume Resultados con claridad y soporte visual.</li>
              <li>Elabora Discusión con interpretación, limitaciones y líneas futuras.</li>
            </ul>
          </div>
          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>Usa <Link href="/escritor-ia">Escritor IA</Link> y <Link href="/corrector-textos-ia">Corrector de textos IA</Link>.</p>
            <Link href="/escritor-ia" className="inline-flex items-center px-4 py-2 rounded-lg mt-4">
              Empezar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
        <section className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-black mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-black mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• <a href="/blog/automatizar-resumenes-reuniones-ia-notion" className="text-primary hover:underline">ia para escritura</a></li>
                  <li>• <a href="/blog/desarrollo-apis-creativas-ia" className="text-primary hover:underline">Desarrollo de APIs para proyectos creativos con IA</a></li>
                  <li>• <a href="/blog/herramientas-ia-resumen-textos-legales-espanol" className="text-primary hover:underline">ia para contenido</a></li>
                  <li>• <a href="/blog/imryd-errores-comunes-ia-espanol" className="text-primary hover:underline">IMRyD con IA</a></li>
                  <li>• <a href="/blog/nurturing-email-ia-saas-seguridad-espanol" className="text-primary hover:underline">ia para escritura</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </div>

        {/* Extracted Content: End */}
      </ArticleLayout>
    </>
  )
}
