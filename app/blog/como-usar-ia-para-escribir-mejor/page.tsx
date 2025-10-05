import Link from 'next/link'
import { Metadata } from 'next'
import { Clock, User, Calendar, Tag, Share2 } from 'lucide-react'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'
import ReadingProgress from '@/components/blog/ReadingProgress'
import { blogPosts, categories } from '@/lib/blog-data'

export const metadata: Metadata = {
  title: 'Cómo usar IA para escribir mejor: Guía completa 2025 | Red Creativa Pro',
  description: 'Descubre las mejores técnicas y herramientas de inteligencia artificial para mejorar tu escritura profesional y crear contenido de calidad.',
  keywords: 'IA escritura, inteligencia artificial, escribir mejor, herramientas IA, contenido profesional',
  openGraph: {
    title: 'Cómo usar IA para escribir mejor: Guía completa 2025',
    description: 'Descubre las mejores técnicas y herramientas de inteligencia artificial para mejorar tu escritura profesional.',
    type: 'article',
  }
}

export default function ComoUsarIAParaEscribirMejor() {
  // Get the current post data
  const currentPost = blogPosts.find(post => post.id === 'como-usar-ia-para-escribir-mejor')
  
  if (!currentPost) {
    return <div>Artículo no encontrado</div>
  }

  const category = categories.find(cat => cat.id === currentPost.category)

  return (
    <div className="min-h-screen bg-black text-white">
      <ReadingProgress />
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <span className="text-lg font-semibold text-white">Red Creativa Pro</span>
            </Link>
            <Link href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
              ← Volver al blog
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: category?.name || 'Escritura IA', href: `/blog?category=${currentPost.category}` },
              { label: currentPost.title }
            ]} 
          />

          <article className="mb-12">
            {/* Article Header */}
            <header className="mb-12">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="flex items-center gap-2 text-xs font-medium text-white bg-zinc-800 px-3 py-1 rounded-full">
                  <span className="text-lg">{category?.icon}</span>
                  {category?.name}
                </span>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {currentPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentPost.readTime}
                  </span>

                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {currentPost.title}
              </h1>
              
              <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                {currentPost.excerpt}
              </p>

              {/* Author and Tags */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentPost.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{currentPost.author.name}</p>
                    <p className="text-sm text-zinc-500">{currentPost.author.bio}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {currentPost.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </header>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6 mt-12">¿Por qué usar IA para escribir?</h2>
          
          <p className="text-lg text-zinc-300 leading-relaxed mb-6">
            La escritura con inteligencia artificial no se trata de reemplazar la creatividad humana, sino de potenciarla. En un mundo donde el contenido de calidad es fundamental para el éxito empresarial, las herramientas de IA se han convertido en aliados indispensables.
          </p>
          
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            Las herramientas de IA pueden transformar completamente tu proceso de escritura y ayudarte a:
          </p>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Superar el bloqueo del escritor:</strong>
                  <span className="text-zinc-300"> Genera ideas y primeros borradores instantáneamente, eliminando la página en blanco para siempre</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Mejorar la gramática y estilo:</strong>
                  <span className="text-zinc-300"> Corrige errores automáticamente y optimiza la fluidez del texto en tiempo real</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Adaptar el tono:</strong>
                  <span className="text-zinc-300"> Ajusta el contenido para diferentes audiencias, desde formal hasta conversacional</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Ahorrar tiempo:</strong>
                  <span className="text-zinc-300"> Reduce el tiempo de escritura hasta en un 70%, permitiéndote enfocarte en estrategia</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Mantener consistencia:</strong>
                  <span className="text-zinc-300"> Asegura un estilo uniforme en todos tus textos y comunicaciones</span>
                </div>
              </li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6 mt-12">Las mejores técnicas para escribir con IA</h2>
          
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            Dominar la escritura con IA requiere conocer las técnicas correctas. Estas estrategias probadas te ayudarán a obtener resultados profesionales desde el primer día.
          </p>
          
          <h3 className="text-2xl font-semibold text-white mb-4 mt-10">1. Comienza con prompts específicos</h3>
          <p className="text-lg text-zinc-300 leading-relaxed mb-4">
            La clave del éxito está en dar instrucciones claras y específicas. Un prompt bien estructurado es la diferencia entre contenido mediocre y contenido excepcional.
          </p>
          
          <p className="text-lg text-zinc-300 leading-relaxed mb-4">
            En lugar de escribir "mejora este texto", usa prompts detallados como:
          </p>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <blockquote className="text-green-400 italic text-lg leading-relaxed">
              "Reescribe este párrafo para un público profesional de marketing digital, usando un tono formal pero accesible, enfócate en los beneficios prácticos y ROI, y mantén un máximo de 150 palabras"
            </blockquote>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-8">
            <p className="text-blue-300 mb-2"><strong>💡 Tip profesional:</strong></p>
            <p className="text-zinc-300">Para obtener los mejores prompts, consulta nuestra guía completa: <Link href="/blog/mejores-prompts-ia-escritura" className="text-blue-400 hover:text-blue-300 underline">Los 50 mejores prompts de IA para escritura profesional</Link></p>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-4 mt-10">2. Usa la técnica de iteración</h3>
          <p className="text-lg text-zinc-300 leading-relaxed mb-4">
            No esperes el resultado perfecto en el primer intento. La escritura con IA es un proceso iterativo que mejora con cada refinamiento.
          </p>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h4 className="text-white font-semibold mb-4">Proceso de iteración paso a paso:</h4>
                <ol className="space-y-3 text-zinc-300">
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <span>Genera el primer borrador con IA usando un prompt específico</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <span>Revisa el contenido e identifica áreas de mejora específicas</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <span>Solicita ajustes específicos: "Haz el segundo párrafo más persuasivo"</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <span>Repite el proceso hasta obtener el resultado deseado</span>
                  </li>
                </ol>
              </div>

          <h3 className="text-2xl font-semibold text-white mb-4 mt-10">3. Combina creatividad humana con eficiencia de IA</h3>
          <p className="text-lg text-zinc-300 leading-relaxed mb-6">
            La mejor estrategia es usar la IA como asistente inteligente, no como reemplazo. Esta colaboración humano-IA produce los mejores resultados.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
              <h4 className="text-green-400 font-semibold mb-3">🧠 Tú aportas:</h4>
              <ul className="space-y-2 text-zinc-300">
                <li>• Ideas originales y creativas</li>
                <li>• Experiencia personal y profesional</li>
                <li>• Contexto específico de tu industria</li>
                <li>• Conocimiento de tu audiencia</li>
                <li>• Estrategia y objetivos claros</li>
              </ul>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h4 className="text-blue-400 font-semibold mb-3">🤖 La IA aporta:</h4>
              <ul className="space-y-2 text-zinc-300">
                <li>• Estructura y organización perfecta</li>
                <li>• Gramática y sintaxis impecables</li>
                <li>• Variaciones de estilo y tono</li>
                <li>• Velocidad de ejecución</li>
                <li>• Consistencia en el formato</li>
              </ul>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6 mt-12">Herramientas recomendadas para 2025</h2>
          
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            El mercado de herramientas de IA para escritura ha evolucionado significativamente. Aquí te presentamos las mejores opciones disponibles, desde soluciones especializadas hasta plataformas todo-en-uno.
          </p>
          
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold text-white mb-4">🚀 Red Creativa Pro - Escritor IA</h3>
                <p className="text-lg text-zinc-300 leading-relaxed mb-6">
                  Nuestra herramienta especializada ha sido diseñada específicamente para profesionales que buscan calidad y eficiencia en español.
                </p>
                <Link 
                  href="/escritor-ia" 
                  className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Probar Escritor IA →
                </Link>
              </div>



              <h2 className="text-3xl font-bold text-white mb-6 mt-12">Conclusión</h2>
              
              <p className="text-lg text-zinc-300 leading-relaxed mb-6">
                La escritura con IA no es el futuro, es el presente. Los profesionales que adopten estas herramientas ahora tendrán una ventaja competitiva significativa en los próximos años.
              </p>
              
              <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                Recuerda: la IA es tu asistente, no tu reemplazo. Úsala para potenciar tu creatividad, no para sustituirla. Con las técnicas correctas y las herramientas adecuadas, puedes crear contenido de calidad profesional en una fracción del tiempo.
              </p>
            </div>
          </article>

          {/* Social Share */}
          <div className="mb-12">
            <SocialShare 
              title={currentPost.title}
              url={`/blog/${currentPost.id}`}
              description={currentPost.excerpt}
            />
          </div>

          {/* Related Articles */}
          <RelatedArticles 
            currentPostId={currentPost.id}
            category={currentPost.category}
            tags={currentPost.tags}
          />
        </div>
      </div>
    </div>
  )
}