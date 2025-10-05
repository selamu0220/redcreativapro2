import Link from 'next/link'
import { Clock, Calendar, Tag, Share2 } from 'lucide-react'
import { BlogPost } from '@/lib/blog-data'
import Breadcrumbs from '@/app/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'

interface BlogPostLayoutProps {
  post: BlogPost
  children: React.ReactNode
}

export default function BlogPostLayout({ post, children }: BlogPostLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
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

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          category={post.category}
          subcategory={post.subcategory}
          postTitle={post.title}
        />

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-zinc-400 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('es-ES', {
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
                    <span key={tag} className="bg-zinc-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            {children}
          </div>

          {/* Social Share */}
          <div className="mb-8">
            <SocialShare 
              url={`https://redcreativa.pro/blog/${post.id}`}
              title={post.title}
              description={post.excerpt}
            />
          </div>

          {/* Author Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Sobre el autor</h3>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{post.author.name}</h3>
                <p className="text-zinc-400">{post.author.bio}</p>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12">
            <RelatedArticles currentPostId={post.id} />
          </div>
        </article>
      </main>
    </div>
  )
}