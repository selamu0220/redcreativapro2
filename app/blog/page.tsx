'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Search, TrendingUp, Star, Clock, Eye, Heart, ArrowRight, BookOpen, Users, Award, Zap } from 'lucide-react'
import SearchBar, { type SearchFilters } from '@/components/blog/SearchBar'
import Newsletter from '@/components/blog/Newsletter'
import { 
  blogPosts, 
  categories, 
  getFeaturedPosts, 
  getTrendingPosts, 
  getPopularPosts, 
  getRecentPosts,
  searchPosts,
  type BlogPost 
} from '@/lib/blog-data'

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'trending' | 'popular' | 'recent'>('all')
  
  const postsPerPage = 12

  // Get posts based on active tab and search
  const filteredPosts = useMemo(() => {
    let posts: BlogPost[] = []
    
    if (searchQuery || searchFilters.category || searchFilters.subcategory || searchFilters.tags.length > 0) {
      // If there's a search query or filters, search through all posts
      posts = searchQuery ? searchPosts(searchQuery) : blogPosts
      
      // Apply filters
      if (searchFilters.category) {
        posts = posts.filter(post => post.category === searchFilters.category)
      }
      if (searchFilters.subcategory) {
        posts = posts.filter(post => post.subcategory === searchFilters.subcategory)
      }
      if (searchFilters.tags.length > 0) {
        posts = posts.filter(post => 
          searchFilters.tags.some(tag => post.tags.includes(tag))
        )
      }
    } else {
      // No search, use tab-based filtering
      switch (activeTab) {
        case 'featured':
          posts = getFeaturedPosts()
          break
        case 'trending':
          posts = getTrendingPosts()
          break
        case 'popular':
          posts = getPopularPosts()
          break
        case 'recent':
          posts = getRecentPosts()
          break
        default:
          posts = blogPosts
      }
    }

    // Apply sorting
    const sortedPosts = [...posts].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (searchFilters.sortBy) {
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'likes':
          aValue = a.likes
          bValue = b.likes
          break
        case 'readTime':
          aValue = parseInt(a.readTime)
          bValue = parseInt(b.readTime)
          break
        default: // date
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }
      
      return searchFilters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return sortedPosts
  }, [searchQuery, searchFilters, activeTab])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query)
    setSearchFilters(filters)
    setCurrentPage(1)
    setActiveTab('all')
  }

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery('')
    setSearchFilters({
      category: '',
      subcategory: '',
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const featuredPosts = getFeaturedPosts()
  const trendingPosts = getTrendingPosts()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <span className="text-lg font-semibold text-white">Red Creativa Pro</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/escritor-ia" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Escritor IA
              </Link>
              <Link href="/correos-ia" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Correos IA
              </Link>
              <Link href="/planes" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Planes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 py-12 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Blog de Escritura IA
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-8 leading-relaxed">
              Domina la escritura con inteligencia artificial. Guías expertas, tutoriales avanzados y estrategias profesionales para crear contenido excepcional.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>40+ Artículos Detallados</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10+ Categorías Especializadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Contenido de Expertos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Actualizado Semanalmente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Articles Section */}
        {!searchQuery && activeTab === 'all' && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Artículos Destacados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="aspect-video bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <span className="text-6xl">{categories.find(cat => cat.id === post.category)?.icon || '📝'}</span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Destacado
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-white bg-zinc-700 px-3 py-1 rounded-full">
                        {categories.find(cat => cat.id === post.category)?.name}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-zinc-300 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {post.author.name.charAt(0)}
                        </div>
                        <span className="text-xs text-zinc-500">{post.author.name}</span>
                      </div>
                      <span className="text-sm text-white group-hover:text-zinc-300 transition-colors flex items-center gap-1">
                        Leer más <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending Articles Section */}
        {!searchQuery && activeTab === 'all' && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-white">Tendencias</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingPosts.slice(0, 4).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {categories.find(cat => cat.id === post.category)?.icon || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-zinc-300 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} totalResults={filteredPosts.length} />

        {/* Content Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'Todos los artículos', icon: BookOpen },
            { id: 'featured', label: 'Destacados', icon: Star },
            { id: 'trending', label: 'Tendencias', icon: TrendingUp },
            { id: 'popular', label: 'Populares', icon: Eye },
            { id: 'recent', label: 'Recientes', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {paginatedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                  <span className="text-4xl">{categories.find(cat => cat.id === post.category)?.icon || '📝'}</span>
                </div>
                {post.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                    </span>
                  </div>
                )}
                {post.trending && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white bg-zinc-800 px-2 py-1 rounded">
                    {categories.find(cat => cat.id === post.category)?.name}
                  </span>
                  <span className="text-xs text-zinc-500">{post.readTime}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-zinc-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                    </span>
                  </div>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Newsletter Section */}
        <section className="mb-16">
          <Newsletter />
        </section>
      </div>
    </div>
  )
}