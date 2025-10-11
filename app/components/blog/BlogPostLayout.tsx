import Link from 'next/link'
import { Clock, Calendar, Tag, Share2, ArrowLeft } from 'lucide-react'
import { BlogPost, authors } from '@/lib/blog-data'
import Breadcrumbs from '@/app/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { ScrollRevealAnimation } from '@/app/components/ScrollAnimations'
import { motion } from 'framer-motion'

interface BlogPostLayoutProps {
  post: BlogPost
  children: React.ReactNode
}

export default function BlogPostLayout({ post, children }: BlogPostLayoutProps) {
  // Obtener información del autor
  const author = authors.find(a => a.id === post.author) || authors[0];
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-sm">RC</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Red Creativa Pro</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/blog" 
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Link>
              <ThemeToggle variant="button" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <ScrollRevealAnimation>
          <Breadcrumbs 
            category={post.category}
            subcategory={post.subcategory}
            postTitle={post.title}
          />
        </ScrollRevealAnimation>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          <ScrollRevealAnimation delay={0.2}>
            <header className="mb-12">
              {/* Category Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {post.category}
                </span>
              </div>

              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {post.title}
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {post.excerpt}
              </motion.p>
              
              {/* Meta information */}
              <motion.div 
                className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <div className="flex gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {author?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {author?.name || 'Autor'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {author?.role || 'Escritor'}
                    </div>
                  </div>
                </div>
              </motion.div>
            </header>
          </ScrollRevealAnimation>

          {/* Article Content */}
          <ScrollRevealAnimation delay={0.6}>
            <div className="prose prose-gray dark:prose-invert prose-lg max-w-none mb-12 
                          prose-headings:text-gray-900 dark:prose-headings:text-white
                          prose-p:text-gray-700 dark:prose-p:text-gray-300
                          prose-a:text-blue-600 dark:prose-a:text-blue-400
                          prose-strong:text-gray-900 dark:prose-strong:text-white
                          prose-code:text-gray-900 dark:prose-code:text-white
                          prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
                          prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                          prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
              {children}
            </div>
          </ScrollRevealAnimation>

          {/* Social Share */}
          <ScrollRevealAnimation delay={0.8}>
            <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compartir este artículo
              </h3>
              <SocialShare 
                url={`https://redcreativa.pro/blog/${post.id}`}
                title={post.title}
                description={post.excerpt}
              />
            </div>
          </ScrollRevealAnimation>

          {/* Tags Section */}
          <ScrollRevealAnimation delay={1.0}>
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollRevealAnimation>
        </article>

        {/* Related Articles */}
        <ScrollRevealAnimation delay={1.2}>
          <div className="max-w-6xl mx-auto">
            <RelatedArticles currentPost={post} />
          </div>
        </ScrollRevealAnimation>
      </main>
    </div>
  )
}