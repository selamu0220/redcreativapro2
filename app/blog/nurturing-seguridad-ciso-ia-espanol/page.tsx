import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, TrendingUp, Settings, Target, Bot, ArrowRight, Star, Clock, Users, Award, Lightbulb, BarChart3 } from 'lucide-react'
import ArticleLayout from '@/app/components/blog/ArticleLayout';


export const metadata: Metadata = {
  title: 'Nurturing de seguridad para CISO con IA (B2B, español) | Red Creativa Pro',
  description: '💡 Descubre secuencia de nurturing por rol ciso con ia en español: educación ★ valor ✓ activación. ✨ ¡Paso a paso!',
  keywords: 'nurturing CISO español IA, seguridad B2B emails rol, secuencia por rol IA seguridad',
  openGraph: {
    title: 'Nurturing de seguridad para CISO con IA (B2B, español) | Red Creativa Pro',
    description: 'Secuencia por rol CISO: riesgo, caso de uso y activación con IA en español.',
    type: 'article',
    publishedTime: '2025-12-02',
    authors: ['Selamu'],
    tags: ['nurturing','CISO','seguridad','IA','B2B'],
    images: [{ url: 'https://redcreativa.pro/blog/nurturing-seguridad-ciso-ia-espanol/og-image.jpg', width: 1200, height: 630, alt: 'Nurturing CISO IA' }]
  },
  twitter: { card: 'summary_large_image', title: 'Nurturing CISO (español)', images: ['https://redcreativa.pro/blog/nurturing-seguridad-ciso-ia-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/nurturing-seguridad-ciso-ia-espanol' },
  robots: { index: true, follow: true }
}



export default function ArticlePage() {
  const meta = {
      title: 'Nurturing de seguridad para CISO con IA (B2B, español) | Red Creativa Pro',
      description: '💡 Descubre secuencia de nurturing por rol ciso con ia en español: educación ★ valor ✓ activación. ✨ ¡Paso a paso!',
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
          <span className="text-foreground font-medium">Nurturing seguridad para CISO</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <ShieldCheck className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Etapas</h3>
                <ul className="list-disc list-inside">
                  <li>Riesgo y marco</li>
                  <li>Caso de uso y métrica</li>
                  <li>Activación y soporte</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Escribe email de riesgo dirigido a CISO (español, sector específico).</li>
              <li>Redacta caso de uso con métrica relevante del sector.</li>
              <li>Genera email de activación con pasos y soporte.</li>
            </ul>
          </div>
          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>Usa <Link href="/correos-ia">Correos IA</Link> y <Link href="/herramientas-ia-copywriting">Herramientas IA Copywriting</Link>.</p>
            <Link href="/correos-ia" className="inline-flex items-center px-4 py-2 rounded-lg mt-4">
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
                  <li>• <a href="/blog/estructura-imryd-ia-papers-espanol" className="text-primary hover:underline">ia para escritura</a></li>
                  <li>• <a href="/blog/imryd-errores-comunes-ia-espanol" className="text-primary hover:underline">IMRyD con IA</a></li>
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
