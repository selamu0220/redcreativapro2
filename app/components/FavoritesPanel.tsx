'use client'

import React, { useState, useMemo } from 'react'
import { Star, Search, Filter, Grid, List, Heart, Folder, Link2, MessageSquare } from 'lucide-react'
import { Prompt } from '../types/prompts'
import Tooltip from './Tooltip'

interface FavoriteItem {
  id: string
  type: 'prompt' | 'group' | 'chain'
  title: string
  content?: string
  category?: string
  tags?: string[]
  addedToFavoritesAt: Date
  usageCount?: number
}

interface FavoritesPanelProps {
  favoriteItems: FavoriteItem[]
  onSelectItem: (id: string, type: 'prompt' | 'group' | 'chain') => void
  onRemoveFromFavorites: (id: string, type: 'prompt' | 'group' | 'chain') => void
  onEditItem?: (id: string, type: 'prompt' | 'group' | 'chain') => void
  onDuplicateItem?: (id: string, type: 'prompt' | 'group' | 'chain') => void
  className?: string
}

type SortOption = 'recent' | 'alphabetical' | 'category' | 'usage' | 'type'
type ViewMode = 'grid' | 'list'
type FilterOption = 'all' | 'prompts' | 'groups' | 'chains'

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  favoriteItems,
  onSelectItem,
  onRemoveFromFavorites,
  onEditItem,
  onDuplicateItem,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set(favoriteItems.map(item => item.category || '').filter(Boolean))
    return Array.from(cats).sort()
  }, [favoriteItems])

  const filteredAndSortedItems = useMemo(() => {
    let filtered = favoriteItems.filter(item => {
      const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.tags && item.tags.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === item.type + 's')
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      
      return matchesSearch && matchesFilter && matchesCategory
    })

    // Sort items
    filtered.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'recent':
            return new Date(b.addedToFavoritesAt).getTime() - new Date(a.addedToFavoritesAt).getTime()
          case 'alphabetical':
            const titleA = a.title || '';
            const titleB = b.title || '';
            console.log('🔍 FavoritesPanel sorting by name:', { titleA, titleB, typeA: typeof titleA, typeB: typeof titleB });
            return titleA.localeCompare(titleB)
          case 'category':
            const categoryA = a.category || '';
            const categoryB = b.category || '';
            console.log('🔍 FavoritesPanel sorting by category:', { categoryA, categoryB, typeA: typeof categoryA, typeB: typeof categoryB });
            return categoryA.localeCompare(categoryB)
          case 'usage':
            return (b.usageCount || 0) - (a.usageCount || 0)
          case 'type':
            return (a.type || '').localeCompare(b.type || '')
          default:
            return 0
        }
      } catch (error) {
        console.error('❌ Error in FavoritesPanel sorting:', error);
        console.error('Favorite A:', a);
        console.error('Favorite B:', b);
        console.error('Sort by:', sortBy);
        return 0;
      }
    })

    return filtered
  }, [favoriteItems, searchTerm, sortBy, filterBy, selectedCategory])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prompt': return <MessageSquare className="w-4 h-4" />
      case 'group': return <Folder className="w-4 h-4" />
      case 'chain': return <Link2 className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prompt': return 'text-blue-600 dark:text-blue-400'
      case 'group': return 'text-green-600 dark:text-green-400'
      case 'chain': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatAddedAt = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return 'Hoy'
    } else if (diffInDays === 1) {
      return 'Ayer'
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredAndSortedItems.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onSelectItem(item.id, item.type)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`flex items-center space-x-2 ${getTypeColor(item.type)}`}>
              {getTypeIcon(item.type)}
              <span className="text-xs font-medium uppercase tracking-wider">
                {item.type}
              </span>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEditItem && (
                <Tooltip content="Editar" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditItem(item.id, item.type)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </Tooltip>
              )}
              {onDuplicateItem && (
                <Tooltip content="Duplicar" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateItem(item.id, item.type)
                    }}
                    className="p-1 text-gray-400 hover:text-green-500 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Quitar de favoritos" position="top">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFromFavorites(item.id, item.type)
                  }}
                  className="p-1 text-yellow-500 hover:text-red-500 rounded transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </Tooltip>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
            {item.title || 'Sin título'}
          </h3>
          
          {item.content && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
              {item.content}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatAddedAt(item.addedToFavoritesAt)}</span>
            {item.usageCount && (
              <span>{item.usageCount} {item.usageCount === 1 ? 'uso' : 'usos'}</span>
            )}
          </div>
          
          {item.category && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                {item.category}
              </span>
            </div>
          )}
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="p-2 space-y-1">
      {filteredAndSortedItems.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
          onClick={() => onSelectItem(item.id, item.type)}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 ${getTypeColor(item.type)}`}>
              {getTypeIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title || 'Sin título'}
                </h4>
                <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatAddedAt(item.addedToFavoritesAt)}
                </span>
                {item.usageCount && (
                  <>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.usageCount} {item.usageCount === 1 ? 'uso' : 'usos'}
                    </span>
                  </>
                )}
                {item.category && (
                  <>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {item.category}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEditItem && (
              <Tooltip content="Editar" position="top">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditItem(item.id, item.type)
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </Tooltip>
            )}
            {onDuplicateItem && (
              <Tooltip content="Duplicar" position="top">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicateItem(item.id, item.type)
                  }}
                  className="p-1.5 text-gray-400 hover:text-green-500 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </Tooltip>
            )}
            <Tooltip content="Quitar de favoritos" position="top">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFromFavorites(item.id, item.type)
                }}
                className="p-1.5 text-yellow-500 hover:text-red-500 rounded transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Favoritos
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({favoriteItems.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip content="Vista en cuadrícula" position="bottom">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Vista en lista" position="bottom">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Filtros avanzados" position="bottom">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Más reciente</option>
                <option value="alphabetical">Alfabético</option>
                <option value="category">Categoría</option>
                <option value="usage">Más usado</option>
                <option value="type">Tipo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrar por tipo
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="prompts">Prompts</option>
                <option value="groups">Grupos</option>
                <option value="chains">Cadenas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No se encontraron favoritos' : 'No tienes elementos favoritos'}
            </p>
            {searchTerm && (
              <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </div>
    </div>
  )
}

export default FavoritesPanel
export type { FavoriteItem }