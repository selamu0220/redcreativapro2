'use client'

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, Eye, ChevronUp, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  read_time: string
  tags: string[]
  featured: boolean
  trending: boolean
  views: number
  likes: number
  published_at: string
  created_at: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(Math.min(scrollPercent, 100))
    }

    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-muted">
      <div 
        className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function ScrollToTopButton() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!show) return null

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}

function formatContent(content: string): string {
  if (!content || content === 'Content coming soon...') {
    return `
      <div class="text-center py-12 px-6 bg-muted/30 rounded-xl border border-dashed">
        <p class="text-lg text-muted-foreground">
          El contenido completo de este artículo estará disponible próximamente.
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          Mientras tanto, explora otros artículos de nuestro blog.
        </p>
      </div>
    `
  }
  
  return content
    .split('\n')
    .map(paragraph => {
      if (paragraph.startsWith('## ')) {
        return `<h2>${paragraph.substring(3)}</h2>`
      }
      if (paragraph.startsWith('### ')) {
        return `<h3>${paragraph.substring(4)}</h3>`
      }
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return `<p><strong>${paragraph.slice(2, -2)}</strong></p>`
      }
      if (paragraph.trim()) {
        return `<p>${paragraph}</p>`
      }
      return ''
    })
    .join('')
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .single()
      
      if (error || !data) {
        setLoading(false)
        return
      }
      
      setPost(data)

      const { data: related } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('slug', params.slug)
        .limit(3)
      
      setRelatedPosts(related || [])
      setLoading(false)
    }

    fetchPost()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando artículo...</div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgressBar />
      <ScrollToTopButton />

      <header className="sticky top-1 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Blog
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog">
                <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors">
                  {post.category}
                </Badge>
              </Link>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.read_time} de lectura
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{post.author}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.published_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()} vistas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes} likes</span>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>
          </header>

          <div className="relative aspect-[21/9] mb-12 rounded-2xl overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-8 border-t mb-12">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Card className="bg-primary/5 border-primary/20 mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">¿Te ha gustado este artículo?</h3>
              <p className="text-muted-foreground mb-6">
                Descubre cómo Red Creativa Pro puede ayudarte a crear contenido de calidad con IA.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild>
                  <Link href="/escritor-ia">Probar Escritor IA Gratis</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/blog">Ver Más Artículos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>

        {relatedPosts.length > 0 && (
          <section className="pt-8 border-t">
            <h2 className="text-2xl font-bold mb-8">Artículos Relacionados</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all h-full">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {relatedPost.read_time}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-8 bg-muted/30 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Red Creativa Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
