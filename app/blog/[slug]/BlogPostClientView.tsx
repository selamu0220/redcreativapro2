'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { getStockImage } from '@/lib/stock-images'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, Check, Copy, AlertTriangle, Lightbulb, Sparkles, PenTool } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, useScroll, useSpring } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { useSimpleTranslations } from '@/app/lib/simple-translations'
import { RichContentRenderer } from '@/app/components/blog/rich-content/RichContentRenderer'
import { BlogSection } from '@/lib/blog-data'

// --- Interfaces ---
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
    description?: string
    featured: boolean
    trending: boolean
    views: number
    likes: number
    published_at: string
    created_at: string
    structuredContent?: BlogSection[]
}

interface TocItem {
    id: string
    text: string
    level: number
}

// --- Helpers ---
function formatDate(dateString: string, lang: string = 'es'): string {
    const date = new Date(dateString)
    try {
        return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    } catch (e) {
        return dateString
    }
}

function generateId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
}

// Extract TOC from Markdown
function extractToc(markdown: string): TocItem[] {
    const lines = markdown.split('\n')
    const toc: TocItem[] = []

    // Regex for ## Title or ### Title
    const headingRegex = /^(#{2,3})\s+(.+)$/

    lines.forEach(line => {
        const match = line.match(headingRegex)
        if (match) {
            const level = match[1].length
            // Strip markdown formatting (bold, italic)
            const text = match[2].trim()
                .replace(/\*\*/g, '')
                .replace(/__/g, '')
                .replace(/\*/g, '')
                .replace(/_/g, '')

            toc.push({
                id: generateId(text),
                text: text,
                level: level
            })
        }
    })
    return toc
}

// Extract TOC from Structured Content
function extractTocFromStructured(sections: BlogSection[]): TocItem[] {
    return sections.map(section => ({
        id: section.id,
        text: section.title || 'Sección',
        level: 2
    })).filter(item => item.text !== 'Sección');
}

// --- Components ---
function ReadingProgress() {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-[100]"
            style={{ scaleX }}
        />
    )
}

function ShareButtons({ url, title }: { url: string, title: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank')}>
                <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${url}`, '_blank')}>
                <Facebook className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank')}>
                <Linkedin className="w-5 h-5" />
            </Button>
            <div className="h-px w-8 bg-white/10 mx-auto my-2" />
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" onClick={handleCopy}>
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </Button>
        </div>
    )
}

// Custom Markdown Components
const markdownComponents = {
    h2: ({ children }: any) => {
        const text = React.Children.toArray(children).join('')
        const id = generateId(text)
        return (
            <h2 id={id} className="text-3xl md:text-4xl font-bold mt-16 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight scroll-mt-32">
                {children}
            </h2>
        )
    },
    h3: ({ children }: any) => {
        const text = React.Children.toArray(children).join('')
        const id = generateId(text)
        return (
            <h3 id={id} className="text-2xl md:text-3xl font-semibold mt-12 mb-6 text-white tracking-tight scroll-mt-32">
                {children}
            </h3>
        )
    },
    p: ({ children }: any) => (
        <p className="text-lg md:text-xl leading-relaxed text-gray-400 mb-8 text-pretty">
            {children}
        </p>
    ),
    ul: ({ children }: any) => (
        <ul className="list-none space-y-4 mb-8 text-gray-400 text-lg">
            {children}
        </ul>
    ),
    li: ({ children }: any) => (
        <li className="flex gap-3 relative pl-6">
            <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-purple-500/80" />
            <span>{children}</span>
        </li>
    ),
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-purple-500/50 pl-8 py-4 my-12 italic text-2xl font-serif text-white/90 bg-white/5 rounded-r-2xl">
            {children}
        </blockquote>
    ),
    a: ({ href, children }: any) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline decoration-purple-500/30 underline-offset-4 transition-colors font-medium">
            {children}
        </a>
    ),
    img: ({ src, alt }: any) => (
        <div className="my-12">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                <SafeImage
                    src={src}
                    alt={alt || 'Blog image'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>
            {alt && <p className="text-center text-sm text-white/30 mt-3 italic">{alt}</p>}
        </div>
    ),
    table: ({ children }: any) => (
        <div className="overflow-x-auto rounded-xl border border-white/10 my-8">
            <table className="w-full text-sm">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }: any) => (
        <thead className="bg-white/5 border-b border-white/10">
            {children}
        </thead>
    ),
    th: ({ children }: any) => (
        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-purple-300">
            {children}
        </th>
    ),
    tbody: ({ children }: any) => (
        <tbody className="divide-y divide-white/5">
            {children}
        </tbody>
    ),
    tr: ({ children }: any) => (
        <tr className="hover:bg-white/5 transition-colors">
            {children}
        </tr>
    ),
    td: ({ children }: any) => (
        <td className="px-6 py-4 text-left text-gray-300">
            {children}
        </td>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '')
        const language = match ? match[1] : ''

        if (inline) {
            return (
                <code
                    className="bg-white/10 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                >
                    {children}
                </code>
            )
        }

        return (
            <div className="relative group my-8">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="text-xs text-white/40 font-mono bg-black/50 px-2 py-1 rounded">{language || 'text'}</span>
                </div>
                {/* Fallback code block style for hydration mismatch prevention or basic rendering */}
                <code className="block bg-[#1e1e1e] p-6 rounded-xl text-sm text-gray-300 font-mono overflow-x-auto shadow-xl border border-white/5" {...props}>
                    {children}
                </code>
            </div>
        )
    }
}

import GoogleTranslate from '@/app/components/GoogleTranslate'

// --- Main Component ---
export default function BlogPostClientView({ slug }: { slug: string }) {
    const [post, setPost] = useState<BlogPost | null>(null)
    const [toc, setToc] = useState<TocItem[]>([])
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const { t, currentLang } = useSimpleTranslations() // Use hook

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

            // Normalize Content
            // If it's empty (< 50 chars), show fallback message
            let safeContent = data.content || ''

            // Failsafe: Remove markdown code fences if they slipped through
            safeContent = safeContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

            if (safeContent.length < 50) {
                safeContent = `
## Contenido en Actualización
Estamos actualizando este artículo para ofrecerte la mejor información. Vuelve pronto.
`
            }

            if (data.structuredContent) {
                setToc(extractTocFromStructured(data.structuredContent))
                setPost(data)
            } else {
                setToc(extractToc(safeContent))
                setPost({ ...data, content: safeContent })
            }

            // Related Posts
            const { data: related } = await supabase
                .from('blog_posts')
                .select('*')
                .neq('slug', slug)
                .eq('category', data.category)
                .limit(3)

            setRelatedPosts(related || [])
            setLoading(false)
        }

        fetchPost()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-1 bg-white/20 overflow-hidden rounded-full">
                    <div className="w-full h-full bg-white origin-left animate-[shimmer_1s_infinite]" />
                </div>
            </div>
        )
    }

    if (!post) notFound()

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 font-sans">
            <ReadingProgress />

            {/* Navbar */}
            <header className="fixed top-0 z-50 w-full transition-all duration-300 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="container flex h-16 items-center px-4 justify-between max-w-5xl mx-auto">
                    <Link href="/blog" className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors group">
                        <span className="hidden sm:inline">{t('blog')}</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <GoogleTranslate />
                        <Badge variant="outline" className="border-white/10 text-white/50 text-xs uppercase tracking-widest font-mono">
                            {post.category}
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
                <div className="container px-4 max-w-4xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                {post.author[0]}
                            </div>
                            <span>{post.author}</span>
                        </div>
                        <span className="hidden md:inline">•</span>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.read_time || '5 min'}
                        </div>
                        <span className="hidden md:inline">•</span>
                        <span>{formatDate(post.published_at, currentLang)}</span>
                    </motion.div>
                </div>
            </section>

            {/* Featured Image */}
            <div className="container px-4 max-w-6xl mx-auto mb-20 md:mb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                >
                    <SafeImage
                        src={post.image}
                        fallbackSrc={getStockImage(post.category)}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
                </motion.div>
            </div>

            {/* Main Content */}
            <main className="container px-4 max-w-6xl mx-auto pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* Sidebar / TOC */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="sticky top-32">
                            <ShareButtons url={`https://redcreativa.pro/blog/${post.slug}`} title={post.title} />
                            {toc.length > 0 && (
                                <div className="mt-8">
                                    <TableOfContents headers={toc} className="block w-full" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Article Content */}
                    <article className="lg:col-span-8">
                        {toc.length > 0 && (
                            <div className="lg:hidden mb-12">
                                <TableOfContents headers={toc} className="w-full static max-h-none" />
                            </div>
                        )}

                        <div className="min-h-[300px]">
                            {post.structuredContent ? (
                                <div className="space-y-12">
                                    {post.structuredContent.map((section) => (
                                        <section key={section.id} id={section.id} className="scroll-mt-32">
                                            {section.title && (
                                                <h2 className="text-3xl md:text-4xl font-bold mt-16 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                                                    {section.title}
                                                </h2>
                                            )}
                                            <RichContentRenderer content={section.content} />
                                        </section>
                                    ))}
                                </div>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {post.content}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                            <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="px-4 py-1.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer rounded-full">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </article>

                    {/* CTA Section - AI Writer */}
                    <div className="lg:col-span-8 lg:col-start-3 my-16">
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/20 shadow-2xl p-8 md:p-12 text-center group">
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-colors" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-medium mb-6 border border-white/5">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{t('blog_boost_writing')}</span>
                                </div>

                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                                    {t('blog_cta_title')}
                                </h3>
                                <p className="text-lg text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
                                    {t('blog_cta_desc')}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                    <Link href="/escritor-ia" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-white text-purple-950 hover:bg-gray-100 font-bold text-base h-12 px-8 rounded-full shadow-xl shadow-purple-900/20 transition-transform hover:scale-105">
                                            <PenTool className="w-4 h-4 mr-2" />
                                            {t('blog_cta_button')}
                                        </Button>
                                    </Link>
                                    <Link href="/planes" className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-medium text-base h-12 px-8 rounded-full">
                                            {t('blog_cta_plans')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Author Bio (Mobile/Desktop) */}
                    <div className="lg:col-span-8 lg:col-start-3 mt-12 mb-24">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white/10">
                                    {post.author[0]}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{t('blog_written_by')} {post.author}</h3>
                                    <p className="text-purple-400 text-sm font-medium">{t('blog_author_role')} {t('footer_brand_name') || 'Red Creativa Pro'}</p>
                                </div>
                                <p className="text-white/60 leading-relaxed max-w-2xl">
                                    Experto en inteligencia artificial y creación de contenidos. Apasionado por investigar las últimas herramientas y estrategias para potenciar la productividad creativa.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2" />
                </div>
            </main>

            {/* Read Next Section */}
            {relatedPosts.length > 0 && (
                <section className="border-t border-white/5 bg-white/[0.02] py-24">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <h2 className="text-3xl font-bold tracking-tight mb-12">{t('blog_related_posts')}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedPosts.map((p) => (
                                <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-white/5">
                                        <SafeImage
                                            src={p.image}
                                            fallbackSrc={getStockImage(p.category)}
                                            alt={p.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        />
                                    </div>
                                    <p className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">{p.category}</p>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">{p.title}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
