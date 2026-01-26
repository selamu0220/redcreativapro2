import Link from 'next/link'
import { Search, ArrowLeft, TrendingUp } from 'lucide-react'
import { blogPosts, categories } from '@/lib/blog-data'

export default function BlogNotFound() {
  // Get featured and trending articles for recommendations
  const featuredPosts = blogPosts.filter(post => post.featured).slice(0, 3)
  const trendingPosts = blogPosts.filter(post => post.trending).slice(0, 3)
  const recentPosts = blogPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  // Get popular categories
  const popularCategories = categories.slice(0, 6)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-border bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 responsive-container">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <span className="text-lg font-semibold text-white">Red Creativa Pro</span>
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground400 hover:text-white transition-colors">
              ← Volver al blog
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 responsive-container">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Message */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Artículo no encontrado
            </h2>
            <p className="text-xl text-muted-foreground400 mb-8">
              Lo sentimos, el artículo que buscas no existe o ha sido movido. 
              Pero no te preocupes, tenemos mucho contenido increíble para ti.
            </p>
            
            {/* Back to Blog Button */}
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Blog
            </Link>
            
            {/* Search Button */}
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Artículos
            </Link>
          </div>

          {/* Popular Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-white">Explora por Categorías</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {popularCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.id}`}
                  className="p-4 bg-primary hover:bg-zinc-800 rounded-lg border border-border hover:border-border transition-all group"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-sm text-muted-foreground400 mt-1">
                    Explora artículos sobre {category.name.toLowerCase()}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Articles */}
          <div className="grid md:grid-cols-3 gap-8 mobile-spacing">
            {/* Featured Articles */}
            {featuredPosts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
                  Artículos Destacados
                </h3>
                <div className="space-y-4">
                  {featuredPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="block p-4 bg-primary hover:bg-zinc-800 rounded-lg border border-border hover:border-border transition-all text-left"
                    >
                      <h4 className="font-semibold text-white hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground400 mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground500">
                        <span>{post.readTime}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Articles */}
            {trendingPosts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Tendencias
                </h3>
                <div className="space-y-4">
                  {trendingPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="block p-4 bg-primary hover:bg-zinc-800 rounded-lg border border-border hover:border-border transition-all text-left"
                    >
                      <h4 className="font-semibold text-white hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground400 mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground500">
                        <span>{post.readTime}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Articles */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Artículos Recientes
              </h3>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="block p-4 bg-primary hover:bg-zinc-800 rounded-lg border border-border hover:border-border transition-all text-left"
                  >
                    <h4 className="font-semibold text-white hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-muted-foreground400 mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground500">
                      <span>{post.readTime}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-800/50 mobile-spacing">
            <h3 className="text-2xl font-bold mb-4 text-white">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-muted-foreground300 mb-6">
              Explora nuestra colección completa de artículos sobre IA, escritura y marketing digital.
            </p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Todos los Artículos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


