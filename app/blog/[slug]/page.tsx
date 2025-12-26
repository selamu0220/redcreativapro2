import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Clock, Calendar, Tag, ArrowLeft } from 'lucide-react'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'
import BlogPostClient from '@/components/blog/BlogPostClient'
import BlogContent from '@/components/blog/BlogContent'
import TableOfContents from '@/components/blog/TableOfContents'
import Newsletter from '@/components/blog/Newsletter'
import ReadingProgress from '@/components/blog/ReadingProgress'
import StructuredData from '@/components/seo/StructuredData'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { blogPosts, categories, authors } from '@/lib/blog-data'
import { findArticlesByPartialSlug, log404Error } from '@/lib/blog-utils'
import { wisp } from "@/app/lib/wisp"
import { strapi } from "@/app/lib/strapi"
import Footer from "@/app/components/Footer"
import { Badge } from "@/app/components/ui/badge"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  // 1. Try to find the post in local blog data
  let currentPost = blogPosts.find(post => post.id === slug)
  
  // 2. If not found locally, try Strapi
  let postData = null
  let source = null

  if (!currentPost) {
    try {
      const result = await strapi.getPost(slug)
      if (result.post) {
        postData = result.post
        source = 'strapi'
      }
    } catch (error) {
      console.error('Error fetching from Strapi:', error)
    }

    // 3. If still not found, try Wisp
    if (!postData) {
      try {
        const result = await wisp.getPost(slug)
        if (result.post) {
          postData = result.post
          source = 'wisp'
        }
      } catch (error) {
        console.error('Error fetching from Wisp:', error)
      }
    }
  }

    // If found in Strapi or Wisp, render external version
    if (postData) {
      const { title, publishedAt, createdAt, content, tags, image, description } = postData
      const date = new Date(publishedAt || createdAt)
      const readTime = `${Math.ceil(content.length / 1000)} min de lectura`
      
        return (
          <BlogPostClient postId={slug} postTitle={title}>
            <ReadingProgress />
            <div className="min-h-screen bg-background text-foreground">
              <main className="container mx-auto px-4 py-12 max-w-4xl">
                <Breadcrumbs
                  items={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Blog', href: '/blog' },
                    { label: title }
                  ]}
                />

                <article className="mt-8 blog-article">
                  <header className="mb-12">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tags.map((tag: any) => (
                        <Badge key={tag.id || tag.name} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-4 py-1 border-none shadow-sm">
                          <Tag className="w-3 h-3 mr-1.5" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] text-foreground tracking-tight">
                      {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {date.toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{readTime}</span>
                      </div>
                    </div>

                    {image && (
                      <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-border shadow-2xl group">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </header>

                  <div className="grid grid-cols-1 gap-12">
                    <div className="order-2 lg:order-1">
                      <TableOfContents content={content} />
                      <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 mobile-spacing shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
                        <BlogContent content={content} />
                        
                        <div className="mt-16 pt-12 border-t border-border">
                          <Newsletter />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

            </main>

            <Footer />
            <SimpleLanguageToggle />
          </div>
        </BlogPostClient>
      )
    }


  // 3. If still not found, try intelligent redirection (for local slugs)
  if (!currentPost) {
    const similarBySlug = findArticlesByPartialSlug(slug)

    if (similarBySlug.length > 0) {
      try {
        await log404Error(`/blog/${slug}`)
      } catch (error) {
        console.error('Failed to log 404:', error)
      }
      redirect(`/blog/${similarBySlug[0].id}`)
    }

    try {
      await log404Error(`/blog/${slug}`)
    } catch (error) {
      console.error('Failed to log 404:', error)
    }

    notFound()
  }

  // 4. Render Local Post version
  const category = categories.find(cat => cat.id === currentPost!.category)
  const subcategory = category?.subcategories.find(sub => sub.id === currentPost!.subcategory)
  const author = authors.find(auth => auth.id === currentPost!.author)
  const currentUrl = `https://redcreativa.pro/blog/${currentPost!.id}`

    return (
      <BlogPostClient postId={currentPost!.id} postTitle={currentPost!.title}>
        <ReadingProgress />
        <StructuredData post={currentPost!} url={currentUrl} />
        <div className="min-h-screen bg-background text-foreground">

          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: category?.name || 'Categoría', href: `/blog?category=${currentPost!.category}` },
                { label: currentPost!.title }
              ]}
            />

            {/* Article Header */}
            <article className="mt-8 blog-article">
              <header className="mb-12">
                {/* Category & Tags */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <Badge className={`${category?.color || 'bg-black'} text-white border-none rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2 text-sm font-bold`}>
                    <span className="text-base">{category?.icon}</span>
                    {category?.name}
                  </Badge>
                  {subcategory && (
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium">
                      {subcategory.name}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] text-foreground tracking-tight">
                  {currentPost!.title}
                </h1>

                {/* Excerpt */}
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed font-medium italic border-l-4 border-primary/20 pl-6 py-2">
                  {currentPost!.excerpt}
                </p>

                {/* Meta Information & Author */}
                <div className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground mb-12 pb-8 border-b border-border">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {new Date(currentPost!.publishedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{currentPost!.readTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Por</span>
                    <Link
                      href="/creador"
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-all font-bold group"
                    >
                      <div className="relative">
                        <img
                          src={author?.avatar}
                          alt={author?.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      </div>
                      {author?.name}
                    </Link>
                  </div>
                </div>

                {/* Featured Image */}
                {currentPost!.image && (
                  <div className="relative aspect-video rounded-[3rem] overflow-hidden mb-16 border border-border shadow-2xl group">
                    <img
                      src={currentPost!.image}
                      alt={currentPost!.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 gap-12">
                <div className="relative">
                  <TableOfContents content={currentPost!.content} />
                  
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 mobile-spacing shadow-2xl relative overflow-hidden mb-16">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
                    <BlogContent content={currentPost!.content || 'Contenido no disponible.'} />
                    
                    {/* Inner CTA */}
                    <div className="mt-20 pt-12 border-t border-border">
                      <Newsletter />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-16 justify-center">
                    {currentPost!.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-full px-5 py-2 bg-secondary/50 text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-default"
                      >
                        <Tag className="w-3.5 h-3.5 mr-2" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Social Share & Author Card */}
                  <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-muted/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Sobre el autor
                      </h3>
                      <div className="flex items-start gap-6">
                        <img
                          src={author?.avatar}
                          alt={author?.name}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/10"
                        />
                        <div>
                          <h4 className="font-bold text-lg mb-2">{author?.name}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {author?.bio}
                          </p>
                          <Link
                            href="/creador"
                            className="text-primary hover:underline font-bold text-sm inline-flex items-center gap-1 group"
                          >
                            Conoce mi historia 
                            <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 border border-border rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-black mb-4">¿Te gustó el artículo?</h3>
                      <p className="text-muted-foreground text-sm mb-6">Compártelo con tu red y ayúdanos a crecer.</p>
                      <SocialShare
                        url={`https://redcreativa.pro/blog/${currentPost!.id}`}
                        title={currentPost!.title}
                        description={currentPost!.excerpt}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              <div className="pt-16 border-t border-border">
                <h2 className="text-3xl font-black mb-10 text-center">Artículos Relacionados</h2>
                <RelatedArticles
                  currentPostId={currentPost!.id}
                  category={currentPost!.category}
                  tags={currentPost!.tags}
                />
              </div>
            </article>
          </div>
        </div>

        <Footer />
        <SimpleLanguageToggle />
      </BlogPostClient>
    )
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  
  // Try local first
  const post = blogPosts.find(p => p.id === slug)
  if (post) {
    const currentUrl = `https://redcreativa.pro/blog/${post.id}`
    return {
      title: post.seoTitle || `${post.title} | Red Creativa Pro`,
      description: post.seoDescription || post.excerpt,
      keywords: post.tags.join(', '),
      canonical: currentUrl,
      alternates: { canonical: currentUrl },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.publishedAt,
        url: currentUrl,
        images: [{ url: post.image || 'https://redcreativa.pro/og-image.jpg' }],
      }
    }
  }

  // Try Strapi
  try {
    const result = await strapi.getPost(slug)
    if (result.post) {
      const { title, description, image } = result.post
      return {
        title: `${title} | Red Creativa Pro`,
        description: description,
        openGraph: {
          title: title,
          description: description,
          images: image ? [{ url: image }] : [],
        },
      }
    }
  } catch (e) {}

  // Try Wisp
  try {
    const result = await wisp.getPost(slug)
    if (result.post) {
      const { title, description, image } = result.post
      return {
        title: `${title} | Red Creativa Pro`,
        description: description,
        openGraph: {
          title: title,
          description: description,
          images: image ? [{ url: image }] : [],
        },
      }
    }
  } catch (e) {}

  return {
    title: 'Artículo no encontrado | Red Creativa Pro',
    description: 'Artículo no encontrado'
  }
}

export async function generateStaticParams() {
  const localParams = blogPosts.map((post) => ({
    slug: post.id,
  }))

  let strapiParams: any[] = []
  try {
    const result = await strapi.getPosts({ limit: 100 })
    strapiParams = result.posts.map((post: any) => ({
      slug: post.slug,
    }))
  } catch (e) {}

  try {
    const result = await wisp.getPosts({ limit: 100 })
    const wispParams = result.posts.map((post) => ({
      slug: post.slug,
    }))
    return [...localParams, ...strapiParams, ...wispParams]
  } catch (e) {
    return [...localParams, ...strapiParams]
  }
}
