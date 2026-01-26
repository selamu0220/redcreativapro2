'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { getStockImage } from '@/lib/stock-images'
import { useAuth } from '@/app/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, TrendingUp, Sparkles, ArrowRight, BookOpen, PenTool, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
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

// Separate component for Server Data Fetching to Client Component 
// Ideally we keep the page server-side and pass data, but for animations often client components are easier.
// Let's use a Hybrid approach: Data passed from Server Page (wrapper) to Client View.

const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVar = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export default function BlogClientView({ initialPosts }: { initialPosts: BlogPost[] }) {
    const { isAuthenticated, login } = useAuth()
    const [posts] = useState<BlogPost[]>(initialPosts)
    const featuredPosts = posts.filter(p => p.featured)
    const trendingPosts = posts.filter(p => p.trending && !p.featured)
    const otherPosts = posts.filter(p => !p.featured && !p.trending)

    // Hero post is the first featured one
    const heroPost = featuredPosts[0]
    const subFeatured = featuredPosts.slice(1, 3)

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 justify-between">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                            <span className="text-primary-foreground font-bold text-sm">RC</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight">Red Creativa Pro</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        <Link href="/blog" className="text-primary font-semibold">Blog</Link>
                        <Link href="/planes" className="text-muted-foreground hover:text-foreground transition-colors">Planes</Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link href="/escritor-ia">
                                    <Button size="sm" variant="default" className="gap-2 rounded-full">
                                        <PenTool className="w-4 h-4" /> Escribir
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button size="sm" variant="ghost">Mi Panel</Button>
                                </Link>
                            </div>
                        ) : (
                            <Button
                                onClick={() => login()}
                                size="sm"
                                className="px-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                variant="ghost"
                            >
                                <LogIn className="w-4 h-4 mr-2" /> Entrar
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-4"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Blog & Recursos
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70"
                    >
                        Ideas que <span className="text-primary">Inspiran</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                        Descubre las últimas tendencias en IA, copywriting y estrategias digitales para potenciar tu creatividad.
                    </motion.p>
                </div>

                {/* Bento Grid - Featured Section */}
                {heroPost && (
                    <motion.section
                        variants={containerVar}
                        initial="hidden"
                        animate="show"
                        className="mb-24"
                    >
                        <div className="flex items-center gap-2 mb-8">
                            <div className="h-8 w-1 bg-primary rounded-full"></div>
                            <h2 className="text-2xl font-bold tracking-tight">Destacado esta semana</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px]">
                            {/* HERO POST - Spans 8 cols */}
                            <motion.div variants={itemVar} className="md:col-span-8 relative group overflow-hidden rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500">
                                <Link href={`/blog/${heroPost.slug}`} className="block h-full w-full">
                                    <div className="absolute inset-0">
                                        <SafeImage
                                            src={heroPost.image}
                                            fallbackSrc={getStockImage(heroPost.category)}
                                            alt={heroPost.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    </div>

                                    <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
                                        <Badge className="mb-4 bg-primary text-primary-foreground border-0 px-3 py-1 text-sm">
                                            {heroPost.category}
                                        </Badge>
                                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary/90 transition-colors">
                                            {heroPost.title}
                                        </h3>
                                        <p className="text-gray-200 line-clamp-2 md:line-clamp-3 text-lg mb-6 max-w-2xl">
                                            {heroPost.excerpt}
                                        </p>
                                        <div className="flex items-center gap-6 text-white/80 text-sm font-medium">
                                            <span className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                                                    {heroPost.author.charAt(0)}
                                                </div>
                                                {heroPost.author}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> {heroPost.read_time}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* SECONDARY FEATURED - Spans 4 cols, stacked */}
                            <div className="md:col-span-4 grid grid-rows-2 gap-6 h-full">
                                {subFeatured.map((post, idx) => (
                                    <motion.div
                                        key={post.id}
                                        variants={itemVar}
                                        className="relative group overflow-hidden rounded-3xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Link href={`/blog/${post.slug}`} className="block h-full">
                                            <SafeImage
                                                src={post.image}
                                                fallbackSrc={getStockImage(post.category)}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 p-6">
                                                <Badge variant="outline" className="mb-2 text-white border-white/20 bg-black/20 backdrop-blur-md">
                                                    {post.category}
                                                </Badge>
                                                <h4 className="text-lg font-bold text-white leading-snug group-hover:text-primary-foreground/90">
                                                    {post.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-white/60 text-xs mt-2">
                                                    <span>{formatDate(post.published_at)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Regular Posts Grid */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h2 className="text-3xl font-bold tracking-tight">Artículos Recientes</h2>
                        </div>
                        <div className="hidden md:flex gap-2">
                            {/* Filters could go here */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {[...trendingPosts, ...otherPosts].map((post, i) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col h-full"
                            >
                                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-2xl mb-5">
                                    <SafeImage
                                        src={post.image}
                                        fallbackSrc={getStockImage(post.category)}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-background/80 backdrop-blur-md text-foreground hover:bg-background/90 border-0 shadow-sm">
                                            {post.category}
                                        </Badge>
                                    </div>
                                </Link>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-3">
                                        <span className="text-primary">{post.author}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>{formatDate(post.published_at)}</span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h3>

                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {post.read_time}
                                        </span>
                                        <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-primary flex items-center gap-1 group/link">
                                            Leer más <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>

            </main>

            <footer className="border-t border-border/40 bg-muted/20 py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
                        <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                            <span className="font-bold text-xs">RC</span>
                        </div>
                        <span className="font-semibold">Red Creativa Pro</span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        © 2025 Todos los derechos reservados. Artículos generados y curados con asistencia de Inteligencia Artificial para maximizar tu creatividad.
                    </p>
                </div>
            </footer>
        </div>
    )
}
