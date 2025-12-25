import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Clock, Calendar, Tag, ArrowLeft } from 'lucide-react'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import RelatedArticles from '@/components/blog/RelatedArticles'
import SocialShare from '@/components/blog/SocialShare'
import BlogPostClient from '@/components/blog/BlogPostClient'
import BlogContent from '@/components/blog/BlogContent'
import StructuredData from '@/components/seo/StructuredData'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { blogPosts, categories, authors } from '@/lib/blog-data'
import { findArticlesByPartialSlug, log404Error } from '@/lib/blog-utils'
import { wisp } from "@/app/lib/wisp"
import { strapi } from "@/app/lib/strapi"
import { Badge } from "@/app/components/ui/badge"
import Footer from "@/app/components/Footer"
import { SimpleMainNavigation } from "@/app/components/SimpleMainNavigation"

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
          <div className="min-h-screen bg-black text-white">
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
                        <Badge key={tag.id || tag.name} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                      {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {date.toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{readTime}</span>
                      </div>
                    </div>

                    {image && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 border border-zinc-800">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </header>

                  <div className="mb-12">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mobile-spacing shadow-2xl">
                      <BlogContent content={content} />
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
      <StructuredData post={currentPost!} url={currentUrl} />
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
              { label: category?.name || 'Categoría', href: `/blog?category=${currentPost!.category}` },
              { label: currentPost!.title }
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                {currentPost!.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
                {currentPost!.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentPost!.publishedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{currentPost!.readTime}</span>
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
                {currentPost!.tags.map((tag) => (
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
                url={`https://redcreativa.pro/blog/${currentPost!.id}`}
                title={currentPost!.title}
                description={currentPost!.excerpt}
              />
            </header>

            {/* Article Content */}
            <div className="mb-12">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mobile-spacing shadow-2xl">
                <BlogContent content={currentPost!.content || 'Contenido no disponible.'} />
              </div>
            </div>

            {/* Related Articles */}
            <RelatedArticles
              currentPostId={currentPost!.id}
              category={currentPost!.category}
              tags={currentPost!.tags}
            />
          </article>
        </div>
      </div>

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
