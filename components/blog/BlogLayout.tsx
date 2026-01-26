'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Calendar, Tag } from 'lucide-react'

interface BlogLayoutProps {
  children: ReactNode
  title: string
  description?: string
  author?: string
  publishedAt?: string
  readTime?: string
  category?: string
  tags?: string[]
  breadcrumbs?: Array<{ label: string; href: string }>
}

export default function BlogLayout({
  children,
  title,
  description,
  author = 'Selamu',
  publishedAt,
  readTime,
  category,
  tags = [],
  breadcrumbs = []
}: BlogLayoutProps) {
  const defaultBreadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(category ? [{ label: category, href: `/blog?category=${category.toLowerCase()}` }] : []),
    ...breadcrumbs
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl responsive-container">
        {/* Breadcrumbs mejorados */}
        <nav 
          className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 overflow-x-auto scrollbar-hide"
          aria-label="Breadcrumb"
        >
          {defaultBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <span className="text-muted-foreground/50">/</span>}
              <Link 
                href={crumb.href} 
                className="hover:text-primary transition-colors whitespace-nowrap"
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-medium truncate">
            {title}
          </span>
        </nav>

        {/* Header del artículo */}
        <header className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al blog
          </Link>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-2xl p-6 md:p-8 mobile-spacing">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground text-2xl md:text-4xl text-3xl md:text-5xl">
              {title}
            </h1>
            
            {description && (
              <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                {description}
              </p>
            )}

            {/* Metadatos del artículo */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{readTime}</span>
                </div>
              )}
              
              {author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Por {author}</span>
                </div>
              )}
              
              {publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(publishedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{tags.length - 5} más
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Contenido principal */}
        <article className="prose prose-lg max-w-none">
          {children}
        </article>
      </div>
    </div>
  )
}