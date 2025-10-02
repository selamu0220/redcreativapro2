'use client'

import { useState, useEffect, useCallback } from 'react'
import { Prompt, PromptGroup, PromptChain } from '../types/prompts'
import { FavoriteItem } from '../components/FavoritesPanel'
import { useStatistics } from './useStatistics'

interface HistoryItem {
  id: string
  type: 'prompt' | 'group' | 'chain'
  title: string
  content?: string
  category?: string
  tags?: string[]
  lastUsed: Date
  usageCount: number
  isFavorite: boolean
  addedToFavoritesAt?: Date
}

interface UseHistoryReturn {
  historyItems: HistoryItem[]
  addToHistory: (item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain') => void
  removeFromHistory: (id: string, type: 'prompt' | 'group' | 'chain') => void
  clearHistory: () => void
  toggleHistoryFavorite: (id: string, type: 'prompt' | 'group' | 'chain') => void
  getFavorites: () => FavoriteItem[]
  removeFavorite: (id: string, type: 'prompt' | 'group' | 'chain') => void
  getUsageCount: (id: string, type: 'prompt' | 'group' | 'chain') => number
  getMostUsedItems: (limit?: number) => HistoryItem[]
  getRecentItems: (limit?: number) => HistoryItem[]
  getFavoriteItems: (limit?: number) => HistoryItem[]
  exportHistory: () => string
  importHistory: (jsonData: string, mergeWithExisting?: boolean) => { success: boolean; imported?: number; error?: string }
  getHistoryStats: () => {
    totalItems: number
    favoriteItems: number
    typeStats: Record<string, number>
    usageStats: { totalUsage: number; averageUsage: number }
    oldestItem?: string
    newestItem?: string
  }
}

const HISTORY_STORAGE_KEY = 'prompt_history'
const MAX_HISTORY_ITEMS = 100

export const useHistory = (): UseHistoryReturn => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const { recordUsage } = useStatistics()

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        // Convert date strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          lastUsed: new Date(item.lastUsed || item.usedAt) // Support both old and new property names
        }))
        setHistoryItems(historyWithDates)
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error)
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyItems))
    } catch (error) {
      console.error('Error saving history to localStorage:', error)
    }
  }, [historyItems])

  const addToHistory = useCallback((item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain') => {
    // Record usage in statistics
    recordUsage(item, getItemFavorite(item, type) || false)
    
    setHistoryItems(prevItems => {
      const existingIndex = prevItems.findIndex(historyItem => 
        historyItem.id === item.id && historyItem.type === type
      )

      let newItems: HistoryItem[]

      if (existingIndex >= 0) {
        // Update existing item
        newItems = [...prevItems]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          lastUsed: new Date(),
          usageCount: newItems[existingIndex].usageCount + 1,
          title: getItemTitle(item, type),
          content: getItemContent(item, type),
          category: getItemCategory(item, type),
          tags: getItemTags(item, type)
        }
      } else {
        // Add new item
        const newHistoryItem: HistoryItem = {
          id: item.id,
          type,
          title: getItemTitle(item, type),
          content: getItemContent(item, type),
          lastUsed: new Date(),
          usageCount: 1,
          isFavorite: getItemFavorite(item, type) || false,
          category: getItemCategory(item, type),
          tags: getItemTags(item, type)
        }
        newItems = [newHistoryItem, ...prevItems]
      }

      // Sort by most recent usage
      newItems.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())

      // Limit history size
      if (newItems.length > MAX_HISTORY_ITEMS) {
        newItems = newItems.slice(0, MAX_HISTORY_ITEMS)
      }

      return newItems
    })
  }, [])

  const removeFromHistory = useCallback((id: string, type: 'prompt' | 'group' | 'chain') => {
    setHistoryItems(prevItems => prevItems.filter(item => !(item.id === id && item.type === type)))
  }, [])

  const clearHistory = useCallback(() => {
    setHistoryItems([])
  }, [])

  const toggleHistoryFavorite = useCallback((id: string, type: 'prompt' | 'group' | 'chain') => {
    setHistoryItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.type === type
          ? { 
              ...item, 
              isFavorite: !item.isFavorite,
              addedToFavoritesAt: !item.isFavorite ? new Date() : undefined
            }
          : item
      )
    )
  }, [])

  const getFavorites = useCallback((): FavoriteItem[] => {
    return historyItems
      .filter(item => item.isFavorite)
      .map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        category: item.category,
        tags: item.tags,
        addedToFavoritesAt: item.addedToFavoritesAt || item.lastUsed,
        usageCount: item.usageCount
      }))
      .sort((a, b) => new Date(b.addedToFavoritesAt).getTime() - new Date(a.addedToFavoritesAt).getTime())
  }, [historyItems])

  const removeFavorite = useCallback((id: string, type: 'prompt' | 'group' | 'chain') => {
    setHistoryItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.type === type
          ? { 
              ...item, 
              isFavorite: false,
              addedToFavoritesAt: undefined
            }
          : item
      )
    )
  }, [])

  const getUsageCount = useCallback((id: string, type: 'prompt' | 'group' | 'chain'): number => {
    const item = historyItems.find(item => item.id === id && item.type === type)
    return item?.usageCount || 0
  }, [historyItems])

  const getMostUsedItems = useCallback((limit: number = 10): HistoryItem[] => {
    return [...historyItems]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }, [historyItems])

  const getRecentItems = useCallback((limit: number = 10): HistoryItem[] => {
    return [...historyItems]
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, limit)
  }, [historyItems])

  const getFavoriteItems = useCallback((): HistoryItem[] => {
    return historyItems.filter(item => item.isFavorite)
  }, [historyItems])

  // Export history data
  const exportHistory = () => {
    const exportData = {
      history: historyItems,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }

  // Import history data
  const importHistory = (jsonData: string, mergeWithExisting = false) => {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.history || !Array.isArray(importData.history)) {
        throw new Error('Invalid history data format')
      }

      const importedHistory = importData.history as HistoryItem[]
      
      setHistoryItems(prevHistory => {
        let newHistory: HistoryItem[]
        
        if (mergeWithExisting) {
          // Merge with existing history, avoiding duplicates
          const existingIds = new Set(prevHistory.map(item => `${item.id}-${item.type}`))
          const uniqueImported = importedHistory.filter(item => 
            !existingIds.has(`${item.id}-${item.type}`)
          )
          newHistory = [...prevHistory, ...uniqueImported]
        } else {
          // Replace existing history
          newHistory = importedHistory
        }
        
        // Sort by lastUsed and limit to 100 items
        newHistory = newHistory
          .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
          .slice(0, 100)
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory))
          } catch (error) {
            console.error('Error saving imported history to localStorage:', error)
          }
        }
        
        return newHistory
      })
      
      return { success: true, imported: importedHistory.length }
    } catch (error) {
      console.error('Error importing history:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get history statistics
  const getHistoryStats = () => {
    const totalItems = historyItems.length
    const favoriteItems = historyItems.filter(item => item.isFavorite).length
    const typeStats = historyItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const usageStats = historyItems.reduce((acc, item) => {
      acc.totalUsage += item.usageCount
      acc.averageUsage = acc.totalUsage / totalItems
      return acc
    }, { totalUsage: 0, averageUsage: 0 })

    return {
      totalItems,
      favoriteItems,
      typeStats,
      usageStats,
      oldestItem: historyItems[historyItems.length - 1]?.lastUsed.toISOString(),
      newestItem: historyItems[0]?.lastUsed.toISOString()
    }
  }

  return {
    historyItems,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleHistoryFavorite,
    getFavorites,
    removeFavorite,
    getUsageCount,
    getMostUsedItems,
    getRecentItems,
    getFavoriteItems,
    exportHistory,
    importHistory,
    getHistoryStats
  }
}

// Helper functions to extract data from different item types
function getItemTitle(item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain'): string {
  if (!item) return 'Unknown'
  
  switch (type) {
    case 'prompt':
      return (item as Prompt)?.title || 'Untitled Prompt'
    case 'group':
      return (item as PromptGroup)?.name || 'Untitled Group'
    case 'chain':
      return (item as PromptChain)?.name || 'Untitled Chain'
    default:
      return 'Unknown'
  }
}

function getItemContent(item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain'): string | undefined {
  if (!item) return undefined
  
  switch (type) {
    case 'prompt':
      return (item as Prompt)?.content || undefined
    case 'group':
      return (item as PromptGroup)?.description || undefined
    case 'chain':
      return (item as PromptChain)?.description || undefined
    default:
      return undefined
  }
}

function getItemCategory(item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain'): string | undefined {
  if (!item) return undefined
  
  switch (type) {
    case 'prompt':
      return (item as Prompt)?.category || undefined
    case 'group':
      return undefined // PromptGroup doesn't have category
    case 'chain':
      return undefined // PromptChain doesn't have category
    default:
      return undefined
  }
}

function getItemTags(item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain'): string[] | undefined {
  if (!item) return undefined
  
  switch (type) {
    case 'prompt':
      return (item as Prompt)?.tags || undefined
    case 'group':
      return undefined // PromptGroup doesn't have tags
    case 'chain':
      return undefined // PromptChain doesn't have tags
    default:
      return undefined
  }
}

function getItemFavorite(item: Prompt | PromptGroup | PromptChain, type: 'prompt' | 'group' | 'chain'): boolean | undefined {
  if (!item) return false
  
  switch (type) {
    case 'prompt':
      return (item as Prompt)?.isFavorite || false
    case 'group':
      return false // PromptGroup doesn't have isFavorite
    case 'chain':
      return false // PromptChain doesn't have isFavorite
    default:
      return false
  }
}

export type { HistoryItem }