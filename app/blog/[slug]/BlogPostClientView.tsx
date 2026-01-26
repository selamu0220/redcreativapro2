'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { getStockImage } from '@/lib/stock-images'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, Eye, ChevronUp, Tag, Copy, Check, Facebook, Twitter, Linkedin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, useScroll, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

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

function ReadingProgress() {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-purple-500 origin-left z-[100]"
            style={{ scaleX }}
        />
    )
}

function ShareButtons({ url, title }: { url: string, title: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col gap-3 fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex">
            <Button variant="outline" size="icon" className="rounded-full shadow-md hover:scale-110 transition-transform hover:text-blue-600" onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${url}`, '_blank')}>
                <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-md hover:scale-110 transition-transform hover:text-sky-500" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank')}>
                <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-md hover:scale-110 transition-transform hover:text-blue-700" onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank')}>
                <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-md hover:scale-110 transition-transform hover:text-green-600" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    )
}

function formatContent(content: string): string {
    if (!content || content.toLowerCase() === 'content coming soon...') {
        return `
      <div class="text-center py-16 px-6 bg-muted/20 rounded-3xl border border-dashed border-primary/20">
        <div class="mb-4 text-4xl">🚧</div>
        <p class="text-xl font-medium text-foreground mb-2">
          Contenido en construcción
        </p>
        <p class="text-muted-foreground">
          Estamos dando los últimos retoques a este artículo increíble.
        </p>
      </div>
    `
    }

    // Basic markdown-like parser if needed, or pass HTML directly
    // Enhanced to add premium styling classes
    return content
        .replace(/<h2/g, '<h2 class="text-3xl font-bold mt-12 mb-6 text-foreground tracking-tight"')
        .replace(/<h3/g, '<h3 class="text-2xl font-semibold mt-8 mb-4 text-foreground tracking-tight"')
        .replace(/<p/g, '<p class="text-lg leading-relaxed text-muted-foreground mb-6"')
        .replace(/<ul/g, '<ul class="list-disc pl-6 space-y-2 mb-6 text-muted-foreground"')
        .replace(/<li/g, '<li class="pl-2"')
        .replace(/<blockquote/g, '<blockquote class="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl text-foreground bg-muted/20 rounded-r-lg"')
}

export default function BlogPostClientView({ slug }: { slug: string }) {
    const [post, setPost] = useState<BlogPost | null>(null)
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPost() {
            const supabase = createClient()

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .single()

            if (error || !data) {
                setLoading(false)
                return
            }

            setPost(data)

            // Fetch related
            const { data: related } = await supabase
                .from('blog_posts')
                .select('*')
                .neq('slug', slug)
                .limit(3)

            setRelatedPosts(related || [])
            setLoading(false)
        }

        fetchPost()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">Cargando artículo...</p>
            </div>
        )
    }

    if (!post) notFound()

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
            <ReadingProgress />

            {/* Navbar Overlay */}
            <header className="fixed top-0 z-50 w-full transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Volver al Blog
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            Suscribirse
                        </Button>
                        <Button size="sm" className="rounded-full">
                            Prueba Gratis
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Badge className="px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                            {post.category}
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm md:text-base"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                                {post.author.charAt(0)}
                            </div>
                            <div className="text-left leading-tight">
                                <p className="font-semibold text-foreground">{post.author}</p>
                                <p className="text-xs">{formatDate(post.published_at)}</p>
                            </div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.read_time} de lectura
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Hero Image */}
            <section className="container mx-auto px-4 max-w-5xl mb-16 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl"
                >
                    <SafeImage
                        src={post.image}
                        fallbackSrc={getStockImage(post.category)}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl" />
                </motion.div>
            </section>

            <main className="container mx-auto px-4 max-w-3xl relative">
                <ShareButtons url={`https://redcreativa.pro/blog/${post.slug}`} title={post.title} />

                <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
                </div>

                {post.tags && (
                    <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm cursor-pointer hover:bg-secondary/80">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* CTA Banner */}
                <div className="my-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">¿Te gustó lo que leíste?</h3>
                        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                            Únete a Red Creativa Pro y lleva tu creación de contenido al siguiente nivel con nuestras herramientas de IA.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20" asChild>
                                <Link href="/register">Empezar Gratis</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8 bg-background/50 backdrop-blur-sm" asChild>
                                <Link href="/planes">Ver Planes</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="bg-muted/30 py-20 border-t border-border/50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <h2 className="text-3xl font-bold mb-10 text-center">Más artículos para ti</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all">
                                        <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <footer className="border-t py-12 bg-background text-center text-sm text-muted-foreground">
                <p>© 2025 Red Creativa Pro. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}
