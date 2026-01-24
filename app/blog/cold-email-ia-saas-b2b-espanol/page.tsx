import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, TrendingUp, Settings, Target, Bot, ArrowRight, Star, Clock, Users, Award, Lightbulb, BarChart3 } from 'lucide-react'
import ArticleLayout from '@/app/components/blog/ArticleLayout';


export const metadata: Metadata = {
  title: 'Plantillas de cold email con IA para SaaS B2B en español | Red Creativa Pro',
  description: '💡 Mejora modelos ✓ prompts de cold email b2b en español con ia. mejora apertura e interés ✓ consigue reuniones. ✨ ¡Paso a paso!',
  keywords: 'cold email IA español, SaaS B2B email plantillas, outreach IA español, consecución de reuniones B2B',
  openGraph: {
    title: 'Plantillas de cold email con IA para SaaS B2B en español | Red Creativa Pro',
    description: 'Plantillas de cold email en español con IA para SaaS B2B: apertura, interés y reunión.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['cold email','SaaS','B2B','IA','ventas'],
    images: [{
      url: 'https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Plantillas de cold email con IA para SaaS B2B'
    }]
  },
  twitter: { card: 'summary_large_image', title: 'Cold email IA (SaaS B2B) en español', images: ['https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol' },
  robots: { index: true, follow: true }
}



export default function ArticlePage() {
  const meta = {
      title: 'Plantillas de cold email con IA para SaaS B2B en español | Red Creativa Pro',
      description: '💡 Mejora modelos ✓ prompts de cold email b2b en español con ia. mejora apertura e interés ✓ consigue reuniones. ✨ ¡Paso a paso!',
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
          <span className="text-foreground font-medium">Cold email SaaS B2B</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>

        

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-black/5 border-l-4 border-blue-500 p-6 mb-8">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Estructura efectiva</h3>
                <ul className="text-blue-800 list-disc list-inside">
                  <li>Línea de asunto específica</li>
                  <li>Valor claro con métrica relevante</li>
                  <li>CTA a próxima acción (15 min)</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-black text-foreground mb-6">Plantillas</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-black mb-3">Apertura</h3>
              <p>Asunto: Reduce tu time‑to‑value en [industria] (caso real)</p>
              <p>Cuerpo: Valor, métrica, prueba social y CTA a 15 min.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-black mb-3">Interés</h3>
              <p>Resumen del problema, solución y resultado esperable con ejemplo del sector.</p>
            </div>
          </div>

          <h2 className="text-3xl font-black text-foreground mb-6">Prompts</h2>
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Genera 5 asuntos específicos por industria y rol (español, 45–60 caracteres).</li>
              <li>Escribe 3 variaciones de cold email de 100 palabras con métrica y CTA.</li>
              <li>Redacta un follow‑up cordial con resumen de valor y caso de éxito.
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <Briefcase className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Recursos</h3>
                <p>Usa <Link href="/escritor-ia" className="text-blue-700 hover:text-blue-900">Escritor IA</Link> y <Link href="/prompts" className="text-blue-700 hover:text-blue-900">Prompts</Link> para iterar rápido.</p>
                <Link href="/escritor-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mt-4">
                  Empezar ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <section className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-black mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-black mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• <a href="/blog/plantillas-postcompra-belleza-ia-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/plantillas-correos-ia-ecommerce-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/plantilla-prompts-mejorar-correos-ventas-b2b" className="text-primary hover:underline">Plantilla de prompts para mejorar correos de ventas B2B</a></li>
                  <li>• <a href="/blog/onboarding-email-ia-saas-seguridad-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/reposicion-cabello-ia-espanol" className="text-primary hover:underline">ia para email</a></li>
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
