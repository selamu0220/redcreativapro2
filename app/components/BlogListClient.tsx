"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Search, Clock, Calendar, TrendingUp, Sparkles } from "lucide-react";
import type { LanguageCode } from "../lib/language/config";
import { BlogPost } from "@/app/lib/blog-service";
import SafeDate from "./SafeDate";
import ErrorBoundaryComponent from "./ErrorBoundary";

interface BlogListClientProps {
  initialLang: LanguageCode;
  initialPosts: BlogPost[];
}

import SearchBar, { SearchFilters } from "../components/blog/SearchBar";
import { OptimizedImage } from "@/app/components/OptimizedImage";

// Category color mapping for vibrant badges
const categoryColors: Record<string, string> = {
  'tecnologia': 'bg-blue-500',
  'marketing': 'bg-emerald-500',
  'productividad': 'bg-amber-500',
  'negocios': 'bg-rose-500',
  'copywriting': 'bg-violet-500',
  'seo': 'bg-cyan-500',
  'default': 'bg-primary'
};

const getCategoryColor = (category: string) => {
  const key = category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'default';
  return categoryColors[key] || categoryColors['default'];
};

export default function BlogListClient({ initialLang, initialPosts = [] }: BlogListClientProps) {
  const [mounted, setMounted] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Defensive Data: Deduplicate posts to prevent React key collisions
  const uniquePostsMap = new Map();
  if (Array.isArray(initialPosts)) {
    initialPosts.forEach(p => {
      if (p && p.id && !uniquePostsMap.has(p.id)) {
        uniquePostsMap.set(p.id, p);
      }
    });
  }
  const allPosts = Array.from(uniquePostsMap.values());

  // Initialize filtered posts
  useEffect(() => {
    setFilteredPosts(allPosts);
  }, [initialPosts]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    let results = [...allPosts];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    if (filters.category) {
      results = results.filter(post => post.category === filters.category);
    }

    if (filters.subcategory) {
      results = results.filter(post => post.subcategory === filters.subcategory);
    }

    if (filters.tags.length > 0) {
      results = results.filter(post =>
        filters.tags.every(tag => post.tags.includes(tag))
      );
    }

    results.sort((a, b) => {
      if (filters.sortBy === 'date') {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (filters.sortBy === 'readTime') {
        const timeA = parseInt(a.readTime) || 0;
        const timeB = parseInt(b.readTime) || 0;
        return filters.sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      return 0;
    });

    setFilteredPosts(results);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando blog...</p>
        </div>
      </div>
    );
  }

  // Separate featured post from rest
  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <ErrorBoundaryComponent>
      <div className="min-h-screen bg-background">
        {/* HERO HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 pt-8 pb-16">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide border border-primary/20">
                <Sparkles className="w-4 h-4" />
                RECURSOS PREMIUM
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                Domina la <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">IA Creativa</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Guías prácticas, tutoriales y estrategias para multiplicar tu productividad con inteligencia artificial.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8">
          {/* SEARCH BAR */}
          <div className="max-w-4xl mx-auto mb-12 relative z-10">
            <SearchBar
              onSearch={handleSearch}
              totalResults={filteredPosts.length}
            />
          </div>

          {filteredPosts.length > 0 ? (
            <>
              {/* FEATURED ARTICLE - HERO CARD */}
              {featuredPost && (
                <Link href={`/blog/${featuredPost.slug}`} className="block mb-12 group">
                  <article className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Image Side */}
                      <div className="relative h-64 md:h-[400px] overflow-hidden">
                        <OptimizedImage
                          src={featuredPost.image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200'}
                          alt={featuredPost.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card"></div>

                        {/* Featured Badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className={`${getCategoryColor(featuredPost.category)} text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
                            {featuredPost.category}
                          </span>
                          <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Destacado
                          </span>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <SafeDate date={featuredPost.publishedAt} />
                          </span>
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {featuredPost.readTime || '5 min'}
                          </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-4 leading-tight group-hover:text-primary transition-colors duration-300">
                          {featuredPost.title}
                        </h2>

                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm transition-all duration-300 group-hover:gap-4 shadow-lg shadow-primary/25">
                            Leer Artículo
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* SECTION DIVIDER */}
              {remainingPosts.length > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-xl font-bold text-foreground whitespace-nowrap">Más Artículos</h2>
                  <div className="flex-grow h-px bg-border"></div>
                  <span className="text-sm text-muted-foreground">{remainingPosts.length} artículos</span>
                </div>
              )}

              {/* ARTICLES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {remainingPosts.map((post, index) => (
                  <Link
                    href={`/blog/${post.slug}`}
                    key={`post-${post.id}`}
                    className="group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <article className="h-full bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <OptimizedImage
                          src={post.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`${getCategoryColor(post.category)} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md`}>
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <SafeDate date={post.publishedAt} />
                          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
                          <span>{post.readTime || '5 min'}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-grow mb-4">
                          {post.excerpt}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                          <span>Leer más</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                No se encontraron artículos
              </p>
              <p className="text-muted-foreground">
                Intenta ajustar tu búsqueda o cambiar de categoría.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>
    </ErrorBoundaryComponent>
  );
}
