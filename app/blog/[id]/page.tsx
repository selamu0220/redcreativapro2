import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Clock, Calendar, Tag } from 'lucide-react'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'
import BlogPostClient from '@/components/blog/BlogPostClient'
import StructuredData from '@/components/seo/StructuredData'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { blogPosts, categories, authors } from '@/lib/blog-data'
import { findArticlesByPartialSlug, log404Error } from '@/lib/blog-utils'

interface BlogPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await the params promise
  const resolvedParams = await params

  // Get the current post data by ID
  const currentPost = blogPosts.find(post => post.id === resolvedParams.id)

  // If post not found, try intelligent redirection
  if (!currentPost) {
    // Try to find similar articles by partial slug match
    const similarBySlug = findArticlesByPartialSlug(resolvedParams.id)

    if (similarBySlug.length > 0) {
      // Log the 404 and redirect to the best match
      try {
        await log404Error(`/blog/${resolvedParams.id}`)
      } catch (error) {
        console.error('Failed to log 404:', error)
      }

      // Redirect to the best match with a 302 (temporary redirect)
      redirect(`/blog/${similarBySlug[0].id}`)
    }

    // If no similar articles found, log 404 and show not found page
    try {
      await log404Error(`/blog/${resolvedParams.id}`)
    } catch (error) {
      console.error('Failed to log 404:', error)
    }

    notFound()
  }

  const category = categories.find(cat => cat.id === currentPost.category)
  const subcategory = category?.subcategories.find(sub => sub.id === currentPost.subcategory)
  const author = authors.find(auth => auth.id === currentPost.author)
  const currentUrl = `https://redcreativa.pro/blog/${currentPost.id}`

  return (
    <BlogPostClient postId={currentPost.id} postTitle={currentPost.title}>
      <StructuredData post={currentPost} url={currentUrl} />
      <div className="min-h-screen bg-black text-white">

        {/* Header */}
        <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 responsive-container">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
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

        <div className="container mx-auto px-4 py-8 responsive-container">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: category?.name || 'Categoría', href: `/blog?category=${currentPost.category}` },
              { label: currentPost.title }
            ]}
          />

          {/* Article Header */}
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${category?.color || 'bg-gray-500'}`}>
                  {category?.icon} {category?.name}
                </span>
                {subcategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300">
                    {subcategory.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent text-2xl md:text-4xl text-3xl md:text-5xl">
                {currentPost.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
                {currentPost.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentPost.publishedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{currentPost.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Escrito por</span>
                  <Link
                    href="/creador"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <img
                      src={author?.avatar}
                      alt={author?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    {author?.name}
                  </Link>
                </div>
              </div>

              {/* Author Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Escrito por {author?.name}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-3">
                      {author?.bio}
                    </p>
                    <Link
                      href="/creador"
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                      Conoce mi historia completa →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {currentPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Social Share */}
              <SocialShare
                url={`https://redcreativa.pro/blog/${currentPost.id}`}
                title={currentPost.title}
                description={currentPost.excerpt}
              />
            </header>

            {/* Article Content */}
            <div className="prose prose-invert prose-lg max-w-none mb-12">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mobile-spacing">
                <div className="space-y-6 text-zinc-300 leading-relaxed">
                  {/* Introduction */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Introducción</h2>
                    <p>
                      La inteligencia artificial ha revolucionado la forma en que creamos contenido.
                      En esta guía completa, descubrirás las mejores técnicas y herramientas para
                      aprovechar al máximo la IA en tu escritura profesional.
                    </p>
                  </div>

                  {/* Main Content Sections */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">¿Por qué usar IA para escribir?</h2>
                    <p>
                      La escritura asistida por IA ofrece múltiples beneficios que pueden transformar
                      tu productividad y la calidad de tu contenido:
                    </p>
                    <ul className="list-disc list-inside mt-4 space-y-2">
                      <li>Acelera el proceso de creación de contenido</li>
                      <li>Mejora la consistencia y calidad del texto</li>
                      <li>Supera el bloqueo del escritor</li>
                      <li>Optimiza el contenido para SEO</li>
                      <li>Adapta el tono y estilo según la audiencia</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Mejores herramientas de IA para escritura</h2>
                    <p>
                      Existen diversas herramientas de IA que pueden ayudarte a mejorar tu escritura.
                      Aquí te presentamos las más efectivas:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">ChatGPT</h3>
                        <p className="text-sm">Ideal para generar ideas, estructurar contenido y crear borradores iniciales.</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">Claude</h3>
                        <p className="text-sm">Excelente para contenido largo y análisis detallado de textos.</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">Jasper</h3>
                        <p className="text-sm">Especializado en copywriting y contenido de marketing.</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">Copy.ai</h3>
                        <p className="text-sm">Perfecto para crear variaciones de texto y contenido para redes sociales.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Técnicas avanzadas de prompting</h2>
                    <p>
                      Para obtener los mejores resultados con IA, es crucial dominar el arte del prompting.
                      Aquí tienes algunas técnicas profesionales:
                    </p>
                    <div className="bg-zinc-800 p-6 rounded-lg mt-4">
                      <h3 className="font-semibold text-white mb-3">Estructura de un prompt efectivo:</h3>
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Contexto:</strong> Establece el escenario y propósito</li>
                        <li><strong>Rol:</strong> Define qué papel debe asumir la IA</li>
                        <li><strong>Tarea:</strong> Especifica claramente qué quieres que haga</li>
                        <li><strong>Formato:</strong> Indica cómo quieres recibir la respuesta</li>
                        <li><strong>Restricciones:</strong> Establece límites y requisitos específicos</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Mejores prácticas</h2>
                    <p>
                      Para maximizar el potencial de la IA en tu escritura, sigue estas recomendaciones:
                    </p>
                    <div className="space-y-4 mt-4">
                      <div className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold text-white">Siempre revisa y edita</h3>
                        <p className="text-sm">La IA es una herramienta de apoyo, no un reemplazo del juicio humano.</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-semibold text-white">Mantén tu voz única</h3>
                        <p className="text-sm">Personaliza el contenido generado para que refleje tu estilo y personalidad.</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h3 className="font-semibold text-white">Verifica la información</h3>
                        <p className="text-sm">Siempre confirma los datos y hechos proporcionados por la IA.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Conclusión</h2>
                    <p>
                      La inteligencia artificial ha democratizado la creación de contenido de calidad,
                      permitiendo a escritores de todos los niveles producir textos profesionales y
                      atractivos. Al dominar estas técnicas y herramientas, podrás transformar tu
                      proceso de escritura y alcanzar nuevos niveles de productividad y creatividad.
                    </p>
                    <p className="mt-4">
                      Recuerda que la clave del éxito está en encontrar el equilibrio perfecto entre
                      la eficiencia de la IA y tu toque humano único. ¡Comienza a experimentar con
                      estas herramientas hoy mismo y descubre todo su potencial!
                    </p>
                  </div>
                </div>
              </div>
            </div>



            {/* Related Articles */}
            <RelatedArticles
              currentPostId={currentPost.id}
              category={currentPost.category}
              tags={currentPost.tags}
            />
          </article>
        </div>
      </div>

      {/* Language Toggle */}
      <SimpleLanguageToggle />
    </BlogPostClient>
  )
}

// Generate metadata dynamically
export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  const post = blogPosts.find(p => p.id === resolvedParams.id)

  if (!post) {
    return {
      title: 'Artículo no encontrado | Red Creativa Pro',
      description: '💡 Descubre el artículo que buscas no existe. ✨ ¡Paso a paso!',
      alternates: { canonical: 'https://redcreativa.pro/blog/[id]' }
    }
  }

  const currentUrl = `https://redcreativa.pro/blog/${post.id}`

  return {
    title: post.seoTitle || `${post.title} | Red Creativa Pro`,
    description: post.seoDescription || post.excerpt,
    keywords: post.tags.join(', '),
    canonical: currentUrl,
    alternates: {
      canonical: currentUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Red Creativa Pro'],
      tags: post.tags,
      url: currentUrl,
      siteName: 'Red Creativa Pro',
      locale: 'es_ES',
      images: [
        {
          url: post.image || 'https://redcreativa.pro/og-image.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image || 'https://redcreativa.pro/og-image.jpg'],
      creator: '@redcreativapro',
      site: '@redcreativapro',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.id,
  }))
}