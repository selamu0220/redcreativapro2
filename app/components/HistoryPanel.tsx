'use client'

import React, { useState, useMemo } from 'react'
import { Clock, Star, Trash2, Search, Filter, Calendar } from 'lucide-react'
import { Prompt } from '../types/prompts'
import Tooltip from './Tooltip'

interface HistoryItem {
  id: string
  type: 'prompt' | 'group' | 'chain'
  title: string
  content?: string
  lastUsed: Date
  usageCount: number
  isFavorite?: boolean
  category?: string
  tags?: string[]
}

interface HistoryPanelProps {
  historyItems: HistoryItem[]
  onSelectItem: (id: string, type: 'prompt' | 'group' | 'chain') => void
  onToggleFavorite: (id: string, type: 'prompt' | 'group' | 'chain') => void
  onClearHistory: () => void
  onRemoveFromHistory: (id: string) => void
  className?: string
}

type SortOption = 'recent' | 'frequent' | 'alphabetical' | 'category'
type FilterOption = 'all' | 'favorites' | 'prompts' | 'groups' | 'chains'

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  historyItems,
  onSelectItem,
  onToggleFavorite,
  onClearHistory,
  onRemoveFromHistory,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredAndSortedItems = useMemo(() => {
    let filtered = historyItems.filter(item => {
      const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'favorites' && item.isFavorite) ||
                           (filterBy === item.type + 's')
      
      return matchesSearch && matchesFilter
    })

    // Sort items
    filtered.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'recent':
            return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
          case 'frequent':
            return b.usageCount - a.usageCount
          case 'alphabetical':
            const titleA = a.title || '';
            const titleB = b.title || '';
            console.log('🔍 HistoryPanel sorting by name:', { titleA, titleB, typeA: typeof titleA, typeB: typeof titleB });
            return titleA.localeCompare(titleB)
          case 'category':
            return (a.category || '').localeCompare(b.category || '')
          default:
            return 0
        }
      } catch (error) {
        console.error('❌ Error in HistoryPanel sorting:', error);
        console.error('Conversation A:', a);
        console.error('Conversation B:', b);
        console.error('Sort by:', sortBy);
        return 0;
      }
    })

    return filtered
  }, [historyItems, searchTerm, sortBy, filterBy])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prompt': return '💬'
      case 'group': return '📁'
      case 'chain': return '🔗'
      default: return '📄'
    }
  }

  const formatLastUsed = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Hace unos minutos'
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`
    } else if (diffInHours < 168) {
      return `Hace ${Math.floor(diffInHours / 24)} días`
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historial
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({historyItems.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
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
            <Tooltip content="Limpiar historial" position="bottom">
              <button
                onClick={onClearHistory}
                className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en historial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3">
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
                <option value="frequent">Más usado</option>
                <option value="alphabetical">Alfabético</option>
                <option value="category">Categoría</option>
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
                <option value="favorites">Favoritos</option>
                <option value="prompts">Prompts</option>
                <option value="groups">Grupos</option>
                <option value="chains">Cadenas</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* History Items */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No se encontraron elementos' : 'No hay elementos en el historial'}
            </p>
            {searchTerm && (
              <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredAndSortedItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                onClick={() => onSelectItem(item.id, item.type)}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 text-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title || 'Sin título'}
                      </h4>
                      {item.isFavorite && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatLastUsed(item.lastUsed)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.usageCount} {item.usageCount === 1 ? 'uso' : 'usos'}
                      </span>
                      {item.category && (
                        <>
                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
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
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip content={item.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'} position="top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(item.id, item.type)
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        item.isFavorite
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Quitar del historial" position="top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveFromHistory(item.id)
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPanel
