'use client'

import React, { useState, useMemo } from 'react'
import { Search, Filter, Calendar, Star, Hash, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import TagFilter from './TagFilter'

export interface SearchFilters {
  query: string
  category: string
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year'
  showFavoritesOnly: boolean
  selectedTags: string[]
  sortBy: 'name' | 'date' | 'usage' | 'category'
  sortOrder: 'asc' | 'desc'
  searchIn: 'all' | 'name' | 'content' | 'tags'
}

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableTags: string[]
  availableCategories: string[]
  searchStats?: {
    total: number
    filtered: number
    categories: number
    favorites: number
    hasActiveFilters: boolean
  }
  quickFilters?: {
    showAll: () => void
    showFavorites: () => void
    showRecent: () => void
    showByCategory: (category: string) => void
    showByTag: (tag: string) => void
  }
  searchSuggestions?: string[]
  className?: string
  placeholder?: string
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  availableCategories,
  className = '',
  placeholder = 'Buscar prompts, grupos, cadenas...'
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      category: 'all',
      dateRange: 'all',
      showFavoritesOnly: false,
      selectedTags: [],
      sortBy: 'name',
      sortOrder: 'asc',
      searchIn: 'all'
    })
  }

  const hasActiveFilters = useMemo(() => {
    return filters.category !== 'all' ||
           filters.dateRange !== 'all' ||
           filters.showFavoritesOnly ||
           filters.selectedTags.length > 0 ||
           filters.sortBy !== 'name' ||
           filters.sortOrder !== 'asc' ||
           filters.searchIn !== 'all'
  }, [filters])

  const dateRangeOptions = [
    { value: 'all', label: 'Todas las fechas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'date', label: 'Fecha' },
    { value: 'usage', label: 'Uso' },
    { value: 'category', label: 'Categoría' }
  ]

  const searchInOptions = [
    { value: 'all', label: 'Todo' },
    { value: 'name', label: 'Solo nombre' },
    { value: 'content', label: 'Solo contenido' },
    { value: 'tags', label: 'Solo tags' }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* Search In Selector */}
            <select
              value={filters.searchIn}
              onChange={(e) => updateFilters({ searchIn: e.target.value as SearchFilters['searchIn'] })}
              className="text-xs bg-transparent border-none focus:outline-none text-gray-500 dark:text-gray-400"
            >
              {searchInOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-1 rounded transition-colors ${
                showAdvanced || hasActiveFilters
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Filtros avanzados"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Fecha
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilters({ dateRange: e.target.value as SearchFilters['dateRange'] })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title={filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Favorites Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters({ showFavoritesOnly: !filters.showFavoritesOnly })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                filters.showFavoritesOnly
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star className={`w-4 h-4 ${filters.showFavoritesOnly ? 'fill-current' : ''}`} />
              Solo favoritos
            </button>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              <Hash className="w-3 h-3 inline mr-1" />
              Tags
            </label>
            <TagFilter
              availableTags={availableTags}
              selectedTags={filters.selectedTags}
              onTagsChange={(tags) => updateFilters({ selectedTags: tags })}
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-xs">
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              Categoría: {filters.category}
              <button onClick={() => updateFilters({ category: 'all' })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
              {dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label}
              <button onClick={() => updateFilters({ dateRange: 'all' })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.showFavoritesOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
              <Star className="w-3 h-3 fill-current" />
              Favoritos
              <button onClick={() => updateFilters({ showFavoritesOnly: false })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
