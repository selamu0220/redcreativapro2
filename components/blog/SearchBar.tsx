'use client'

import React, { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { categories } from '@/lib/blog-data'
import {
  ExplodeIn,
  ScrollReveal,
  ParticleExplosion
} from '@/components/animations/SafeBrutalAnimations'
import { usePerformanceOptimization, getOptimizedParticleCount } from '@/hooks/usePerformanceOptimization'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  totalResults?: number
}

export interface SearchFilters {
  category: string
  subcategory: string
  tags: string[]
  sortBy: 'date' | 'readTime'
  sortOrder: 'asc' | 'desc'
}

export default function SearchBar({ onSearch, totalResults }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchClicked, setSearchClicked] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const settings = usePerformanceOptimization()

  const handleSearch = (newQuery?: string, newFilters?: SearchFilters) => {
    const searchQuery = newQuery !== undefined ? newQuery : query
    const searchFilters = newFilters || filters
    setSearchClicked(true)
    setTimeout(() => setSearchClicked(false), 500)
    onSearch(searchQuery, searchFilters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }

    // Reset subcategory if category changes
    if (key === 'category') {
      newFilters.subcategory = ''
    }

    setFilters(newFilters)
    handleSearch(undefined, newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      category: '',
      subcategory: '',
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    handleSearch(query, clearedFilters)
  }

  const selectedCategory = categories.find(cat => cat.id === filters.category)
  const hasActiveFilters = filters.category || filters.subcategory || filters.tags.length > 0

  return (
    <ScrollReveal direction="up" delay={0.1}>
      <motion.div
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8 relative overflow-hidden"
        whileHover={{
          borderColor: "#6b7280",
          boxShadow: "0 0 30px rgba(107, 114, 128, 0.1)"
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Efecto de brillo de fondo */}
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-gray-600/5 via-gray-600/5 to-gray-600/5 rounded-xl blur-xl"
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(getOptimizedParticleCount(settings, 6))].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-gray-400/30 to-gray-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, Math.random() * 8 - 4, 0],
                opacity: [0, 0.4, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: (5 + Math.random() * 3) * settings.animationDuration,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Search Input */}
          <ExplodeIn delay={0.1}>
            <motion.div
              className="relative mb-4"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600" size={20} />
              </motion.div>
              <motion.input
                type="text"
                placeholder="Buscar artículos, tutoriales, guías..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-card border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
                whileFocus={{
                  borderColor: "#6b7280",
                  boxShadow: "0 0 20px rgba(107, 114, 128, 0.2)"
                }}
              />
            </motion.div>
          </ExplodeIn>

          {/* Search Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-4 py-2 bg-card text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showFilters || hasActiveFilters
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
              >
                <Filter size={16} />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-card text-black text-xs px-2 py-0.5 rounded-full">
                    {[filters.category, filters.subcategory, ...filters.tags].filter(Boolean).length}
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                  Limpiar
                </button>
              )}
            </div>

            {totalResults !== undefined && (
              <span className="text-sm text-zinc-400">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    aria-label="Seleccionar categoría"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Filter */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Subcategoría
                  </label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    disabled={!selectedCategory}
                    aria-label="Seleccionar subcategoría"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Todas las subcategorías</option>
                    {selectedCategory?.subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Ordenar por
                  </label>
                  <select aria-label="Seleccionar opción"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value as SearchFilters['sortBy'])}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="date">Fecha</option>
                    <option value="readTime">Tiempo de lectura</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Orden
                  </label>
                  <select aria-label="Seleccionar opción"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as SearchFilters['sortOrder'])}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>

              {/* Popular Tags */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tags populares
                </label>
                <div className="flex flex-wrap gap-2">
                  {['principiantes', 'avanzado', 'chatgpt', 'seo', 'copywriting', 'automatización', 'prompts', 'herramientas'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag]
                        handleFilterChange('tags', newTags)
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filters.tags.includes(tag)
                          ? 'bg-card text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Explosión de partículas al buscar */}
          <ParticleExplosion
            trigger={searchClicked}
            particleCount={12}
          />
        </div>
      </motion.div>
    </ScrollReveal>
  )
}
