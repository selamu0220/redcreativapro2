'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { categories, type BlogPost } from '@/lib/blog-data'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  totalResults?: number
}

export interface SearchFilters {
  category: string
  subcategory: string
  tags: string[]
  sortBy: 'date' | 'views' | 'likes' | 'readTime'
  sortOrder: 'asc' | 'desc'
}

export default function SearchBar({ onSearch, totalResults }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const handleSearch = (newQuery?: string, newFilters?: SearchFilters) => {
    const searchQuery = newQuery !== undefined ? newQuery : query
    const searchFilters = newFilters || filters
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar artículos, tutoriales, guías..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors"
        />
      </div>

      {/* Search Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Buscar
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white text-black text-xs px-2 py-0.5 rounded-full">
                {[filters.category, filters.subcategory, ...filters.tags].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
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
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as SearchFilters['sortBy'])}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="date">Fecha</option>
                <option value="views">Popularidad</option>
                <option value="likes">Likes</option>
                <option value="readTime">Tiempo de lectura</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Orden
              </label>
              <select
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
                  onClick={() => {
                    const newTags = filters.tags.includes(tag)
                      ? filters.tags.filter(t => t !== tag)
                      : [...filters.tags, tag]
                    handleFilterChange('tags', newTags)
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-white text-black'
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
    </div>
  )
}