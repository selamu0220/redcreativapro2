'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { TrendingUp, Star, Clock, ArrowRight, BookOpen, Users, Award, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchBar, { type SearchFilters } from '@/components/blog/SearchBar'
import Newsletter from '@/components/blog/Newsletter'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import GlobalLanguageSwitcher from '@/app/components/GlobalLanguageSwitcher'
import { useSimpleTranslations } from '@/app/lib/simple-translations'
import { useTranslation } from '@/app/lib/language/context'
import { 
  blogPosts, 
  categories, 
  authors,
  getFeaturedPosts, 
  getTrendingPosts, 
  getPopularPosts, 
  getRecentPosts,
  searchPosts,
  type BlogPost 
} from '@/lib/blog-data'
import { 
  ExplodeIn, 
  BrutalSlide, 
  GlitchText, 
  MagneticHover, 
  ScrollReveal,
  ParticleExplosion,
  BrutalTypewriter
} from '@/components/animations/BrutalAnimations'
import { usePerformanceOptimization, getOptimizedParticleCount } from '@/hooks/usePerformanceOptimization'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { ScrollRevealAnimation, StaggeredAnimation } from '@/app/components/ScrollAnimations'

export default function BlogPage() {
  const { t } = useSimpleTranslations();
  const { t: tFull } = useTranslation('blog'); // Sistema completo de traducciones
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
  const settings = usePerformanceOptimization()
  
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
        case 'readTime':
          aValue = parseInt(a.readTime)
          bValue = parseInt(b.readTime)
          break
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'likes':
          aValue = a.likes
          bValue = b.likes
          break
        case 'date':
        default:
          aValue = new Date(a.publishedAt)
          bValue = new Date(b.publishedAt)
      }

      if (searchFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header with theme toggle */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
          <div className="flex items-center gap-4">
            <SimpleLanguageToggle />
            <ThemeToggle variant="button" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <ScrollRevealAnimation className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t('blog.title', 'Descubre el Futuro de la Creatividad')}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('blog.subtitle', 'Artículos, tutoriales y recursos sobre inteligencia artificial, creatividad digital y las últimas tendencias tecnológicas.')}
            </motion.p>
          </div>
        </ScrollRevealAnimation>

        {/* Search Bar */}
        <ScrollRevealAnimation className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </ScrollRevealAnimation>

        {/* Category Tabs */}
        <ScrollRevealAnimation className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { key: 'all', label: 'Todos', icon: BookOpen },
              { key: 'featured', label: 'Destacados', icon: Star },
              { key: 'trending', label: 'Tendencias', icon: TrendingUp },
              { key: 'popular', label: 'Populares', icon: Award },
              { key: 'recent', label: 'Recientes', icon: Clock }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                onClick={() => handleTabChange(key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>
        </ScrollRevealAnimation>

        {/* Stats Section */}
        <ScrollRevealAnimation className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Artículos Totales', value: blogPosts.length, icon: BookOpen, color: 'blue' },
              { label: 'Categorías', value: categories.length, icon: Award, color: 'purple' },
              { label: 'Autores', value: authors.length, icon: Users, color: 'green' },
              { label: 'Lecturas Totales', value: '50K+', icon: Zap, color: 'orange' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              >
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </ScrollRevealAnimation>

        {/* Articles Grid */}
        <StaggeredAnimation staggerDelay={0.1}>
          {paginatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.views} vistas</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Leer más
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <ScrollRevealAnimation>
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron artículos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Intenta ajustar tus filtros de búsqueda o explora otras categorías.
                </p>
              </div>
            </ScrollRevealAnimation>
          )}
        </StaggeredAnimation>

        {/* Pagination */}
        {totalPages > 1 && (
          <ScrollRevealAnimation>
            <div className="flex justify-center items-center gap-2 mb-12">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </ScrollRevealAnimation>
        )}

        {/* Newsletter */}
        <ScrollRevealAnimation>
          <Newsletter />
        </ScrollRevealAnimation>
      </div>
    </div>
  )
}


