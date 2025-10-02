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

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      try {
        switch (filters.sortBy) {
          case 'name':
            const titleA = String(a.title || '');
            const titleB = String(b.title || '');
            console.log('🔍 useAdvancedSearch sorting by name:', { titleA, titleB, typeA: typeof titleA, typeB: typeof titleB });
            comparison = titleA.localeCompare(titleB)
            break
          case 'date':
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            break
          case 'usage':
            comparison = (b.usageCount || 0) - (a.usageCount || 0)
            break
          case 'category':
            const categoryA = String(a.category || '');
            const categoryB = String(b.category || '');
            console.log('🔍 useAdvancedSearch sorting by category:', { categoryA, categoryB, typeA: typeof categoryA, typeB: typeof categoryB });
            comparison = categoryA.localeCompare(categoryB)
            break
          default:
            comparison = 0
        }
      } catch (error) {
        console.error('❌ Error in useAdvancedSearch sorting:', error);
        console.error('Item A:', a);
        console.error('Item B:', b);
        console.error('Sort by:', filters.sortBy);
        comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [items, filters, matchesSearchQuery, isWithinDateRange])

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