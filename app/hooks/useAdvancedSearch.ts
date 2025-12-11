'use client'

import { useState, useMemo, useCallback } from 'react'
import { SearchFilters } from '../components/AdvancedSearch'

export interface SearchableItem {
  id: string
  title: string
  content: string
  category: string
  tags?: string[]
  isFavorite?: boolean
  createdAt: string | Date
  updatedAt: string | Date
  lastUsed?: Date
  usageCount?: number
}

const useAdvancedSearch = <T extends SearchableItem>(items: T[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    dateRange: 'all',
    showFavoritesOnly: false,
    selectedTags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    searchIn: 'all'
  })

  // Get unique categories from items
  const availableCategories = useMemo(() => {
    const categories = new Set(items.map(item => item.category || ''))
    return Array.from(categories).filter(Boolean).sort()
  }, [items])

  // Get unique tags from items
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [items])

  // Date filtering helper
  const isWithinDateRange = useCallback((date: string | Date, range: SearchFilters['dateRange']) => {
    if (range === 'all') return true
    
    const itemDate = new Date(date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (range) {
      case 'today':
        return itemDate >= today
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return itemDate >= weekAgo
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return itemDate >= monthAgo
      case 'year':
        const yearAgo = new Date(today)
        yearAgo.setFullYear(today.getFullYear() - 1)
        return itemDate >= yearAgo
      default:
        return true
    }
  }, [])

  // Search in content helper
  const matchesSearchQuery = useCallback((item: T, query: string, searchIn: SearchFilters['searchIn']) => {
    if (!query) return true
    
    const lowerQuery = query.toLowerCase()
    
    switch (searchIn) {
      case 'name':
        return (item.title || '').toLowerCase().includes(lowerQuery)
      case 'content':
        return (item.content || '').toLowerCase().includes(lowerQuery)
      case 'tags':
        return item.tags?.some(tag => (tag || '').toLowerCase().includes(lowerQuery)) || false
      case 'all':
      default:
        return (
          (item.title || '').toLowerCase().includes(lowerQuery) ||
           (item.content || '').toLowerCase().includes(lowerQuery) ||
          item.tags?.some(tag => (tag || '').toLowerCase().includes(lowerQuery)) ||
          false
        )
    }
  }, [])

  // Safe string conversion helper with fallback values
  const safeStringConversion = useCallback((value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) {
      return fallback
    }
    if (typeof value === 'string') {
      return value
    }
    try {
      return String(value)
    } catch (error) {
      console.warn('Failed to convert value to string:', value, error)
      return fallback
    }
  }, [])

  // Safe locale compare with null/undefined checks
  const safeLocaleCompare = useCallback((a: any, b: any, fallbackA: string = '', fallbackB: string = ''): number => {
    try {
      // Handle null/undefined values first
      if (a === null || a === undefined) a = fallbackA
      if (b === null || b === undefined) b = fallbackB
      
      const stringA = safeStringConversion(a, fallbackA)
      const stringB = safeStringConversion(b, fallbackB)
      
      // Additional safety check before calling localeCompare
      if (typeof stringA !== 'string' || typeof stringB !== 'string') {
        console.warn('safeLocaleCompare: Non-string values after conversion', { stringA, stringB })
        return 0
      }
      
      // Final safety check - ensure strings are not empty or just whitespace
      const finalA = stringA.trim() || fallbackA
      const finalB = stringB.trim() || fallbackB
      
      return finalA.localeCompare(finalB)
    } catch (error) {
      console.error('Error in safeLocaleCompare:', error, { a, b })
      return 0
    }
  }, [safeStringConversion])

  // Main filtering and sorting logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search query filter
      if (!matchesSearchQuery(item, filters.query, filters.searchIn)) {
        return false
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false
      }

      // Date range filter
      if (!isWithinDateRange(item.updatedAt, filters.dateRange)) {
        return false
      }

      // Favorites filter
      if (filters.showFavoritesOnly && !item.isFavorite) {
        return false
      }

      // Tags filter
      if (filters.selectedTags.length > 0) {
        if (!item.tags || !filters.selectedTags.every(tag => item.tags!.includes(tag))) {
          return false
        }
      }

      return true
    })

    // Sorting with comprehensive error boundary
    try {
      filtered.sort((a, b) => {
        let comparison = 0
        
        try {
          switch (filters.sortBy) {
            case 'name':
              // Safe string conversion with null/undefined checks and fallback values
              comparison = safeLocaleCompare(a.title, b.title, 'Sin título', 'Sin título')
              break
            case 'date':
              try {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                
                // Check for invalid dates
                if (isNaN(dateA) || isNaN(dateB)) {
                  console.warn('Invalid dates in sorting:', { 
                    createdAtA: a.createdAt, 
                    createdAtB: b.createdAt,
                    dateA,
                    dateB
                  })
                  comparison = 0
                } else {
                  comparison = dateB - dateA
                }
              } catch (dateError) {
                console.error('Error parsing dates in sorting:', dateError)
                comparison = 0
              }
              break
            case 'usage':
              const usageA = typeof a.usageCount === 'number' ? a.usageCount : 0
              const usageB = typeof b.usageCount === 'number' ? b.usageCount : 0
              comparison = usageB - usageA
              break
            case 'category':
              // Safe string conversion with null/undefined checks and fallback values
              comparison = safeLocaleCompare(a.category, b.category, 'Sin categoría', 'Sin categoría')
              break
            default:
              comparison = 0
          }
        } catch (sortError) {
          console.error('❌ Error in individual sort operation:', sortError)
          console.error('Sort details:', { 
            sortBy: filters.sortBy,
            itemA: { id: a.id, title: a.title, category: a.category },
            itemB: { id: b.id, title: b.title, category: b.category }
          })
          comparison = 0
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison
      })
    } catch (sortingError) {
      console.error('❌ Critical error in sorting logic:', sortingError)
      console.error('Filters:', filters)
      console.error('Items count:', filtered.length)
      
      // Fallback: return unsorted filtered items to prevent complete failure
      console.warn('Returning unsorted items due to sorting error')
    }

    return filtered
  }, [items, filters, matchesSearchQuery, isWithinDateRange, safeLocaleCompare])

  // Search statistics
  const searchStats = useMemo(() => {
    const total = items.length
    const filtered = filteredAndSortedItems.length
    const categories = new Set(filteredAndSortedItems.map(item => item.category || '')).size
    const favorites = filteredAndSortedItems.filter(item => item.isFavorite).length
    
    return {
      total,
      filtered,
      categories,
      favorites,
      hasActiveFilters: (
        filters.query !== '' ||
        filters.category !== 'all' ||
        filters.dateRange !== 'all' ||
        filters.showFavoritesOnly ||
        filters.selectedTags.length > 0
      )
    }
  }, [items, filteredAndSortedItems, filters])

  // Quick filter presets
  const quickFilters = {
    showAll: () => setFilters(prev => ({
      ...prev,
      query: '',
      category: 'all',
      dateRange: 'all',
      showFavoritesOnly: false,
      selectedTags: []
    })),
    showFavorites: () => setFilters(prev => ({ ...prev, showFavoritesOnly: true })),
    showRecent: () => setFilters(prev => ({ ...prev, dateRange: 'week', sortBy: 'date', sortOrder: 'desc' })),
    showByCategory: (category: string) => setFilters(prev => ({ ...prev, category })),
    showByTag: (tag: string) => setFilters(prev => ({ 
      ...prev, 
      selectedTags: prev.selectedTags.includes(tag) 
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }))
  }

  // Search suggestions based on current query
  const searchSuggestions = useMemo(() => {
    if (!filters.query || filters.query.length < 2) return []
    
    const query = filters.query.toLowerCase()
    const suggestions = new Set<string>()
    
    items.forEach(item => {
      // Add matching names
      if ((item.title || '').toLowerCase().includes(query)) {
        suggestions.add(item.title || 'Sin título')
      }
      
      // Add matching tags
      item.tags?.forEach(tag => {
        if ((tag || '').toLowerCase().includes(query)) {
          suggestions.add(tag)
        }
      })
      
      // Add matching categories
      if ((item.category || '').toLowerCase().includes(query)) {
        suggestions.add(item.category)
      }
    })
    
    return Array.from(suggestions).slice(0, 5)
  }, [items, filters.query])

  return {
    filters,
    setFilters,
    filteredAndSortedItems,
    availableCategories,
    availableTags,
    searchStats,
    quickFilters,
    searchSuggestions
  }
}

export default useAdvancedSearch