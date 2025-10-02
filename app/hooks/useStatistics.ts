'use client'

import { useState, useEffect, useMemo } from 'react'
import { Prompt, PromptGroup, PromptChain } from '../types/prompts'

interface UsageStatistics {
  totalUsage: number
  dailyUsage: { date: string; count: number }[]
  weeklyUsage: { week: string; count: number }[]
  monthlyUsage: { month: string; count: number }[]
  categoryUsage: { category: string; count: number }[]
  typeUsage: { type: string; count: number }[]
  topItems: { id: string; title: string; type: string; count: number }[]
  favoriteStats: {
    totalFavorites: number
    favoritesByType: { type: string; count: number }[]
    favoritesByCategory: { category: string; count: number }[]
  }
  timeStats: {
    mostActiveHour: number
    mostActiveDay: string
    averageSessionLength: number
  }
}

interface HistoryEntry {
  id: string
  type: 'prompt' | 'group' | 'chain'
  title: string
  category?: string
  lastUsed: Date
  sessionId: string
  isFavorite?: boolean
}

const STORAGE_KEY = 'prompt_usage_statistics'
const SESSION_STORAGE_KEY = 'current_session_id'

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<UsageStatistics>({
    totalUsage: 0,
    dailyUsage: [],
    weeklyUsage: [],
    monthlyUsage: [],
    categoryUsage: [],
    typeUsage: [],
    topItems: [],
    favoriteStats: {
      totalFavorites: 0,
      favoritesByType: [],
      favoritesByCategory: []
    },
    timeStats: {
      mostActiveHour: 0,
      mostActiveDay: 'Monday',
      averageSessionLength: 0
    }
  })

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [currentSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
      }
      return sessionId
    }
    return `session_${Date.now()}`
  })

  // Load statistics from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          setHistoryEntries(data.entries || [])
        }
      } catch (error) {
        console.error('Error loading statistics:', error)
      }
    }
  }, [])

  // Calculate statistics from history entries
  const calculatedStatistics = useMemo(() => {
    if (historyEntries.length === 0) return statistics

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Filter recent entries
    const recentEntries = historyEntries.filter(entry => 
      new Date(entry.lastUsed) >= thirtyDaysAgo
    )

    // Daily usage
    const dailyUsage = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = recentEntries.filter(entry => 
        new Date(entry.lastUsed).toISOString().split('T')[0] === dateStr
      ).length
      return { date: dateStr, count }
    }).reverse()

    // Weekly usage
    const weeklyUsage = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      const count = historyEntries.filter(entry => {
        const entryDate = new Date(entry.lastUsed)
        return entryDate >= weekStart && entryDate < weekEnd
      }).length
      return { 
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`, 
        count 
      }
    }).reverse()

    // Monthly usage
    const monthlyUsage = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const count = historyEntries.filter(entry => {
        const entryDate = new Date(entry.lastUsed)
        return entryDate >= month && entryDate < nextMonth
      }).length
      return { 
        month: month.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }), 
        count 
      }
    }).reverse()

    // Category usage
    const categoryMap = new Map<string, number>()
    historyEntries.forEach(entry => {
      const category = entry.category || 'Sin categoría'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })
    const categoryUsage = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // Type usage
    const typeMap = new Map<string, number>()
    historyEntries.forEach(entry => {
      const type = entry.type === 'prompt' ? 'Prompts' : 
                   entry.type === 'group' ? 'Grupos' : 'Cadenas'
      typeMap.set(type, (typeMap.get(type) || 0) + 1)
    })
    const typeUsage = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))

    // Top items
    const itemMap = new Map<string, { title: string; type: string; count: number }>()
    historyEntries.forEach(entry => {
      const key = `${entry.type}-${entry.id}`
      const existing = itemMap.get(key)
      if (existing) {
        existing.count++
      } else {
        itemMap.set(key, {
          title: entry.title,
          type: entry.type,
          count: 1
        })
      }
    })
    const topItems = Array.from(itemMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Favorite stats
    const favorites = historyEntries.filter(entry => entry.isFavorite)
    const favoritesByType = Array.from(
      favorites.reduce((map, entry) => {
        const type = entry.type === 'prompt' ? 'Prompts' : 
                     entry.type === 'group' ? 'Grupos' : 'Cadenas'
        map.set(type, (map.get(type) || 0) + 1)
        return map
      }, new Map<string, number>())
    ).map(([type, count]) => ({ type, count }))

    const favoritesByCategory = Array.from(
      favorites.reduce((map, entry) => {
        const category = entry.category || 'Sin categoría'
        map.set(category, (map.get(category) || 0) + 1)
        return map
      }, new Map<string, number>())
    ).map(([category, count]) => ({ category, count }))

    // Time stats
    const hourMap = new Map<number, number>()
    const dayMap = new Map<string, number>()
    const sessions = new Map<string, Date[]>()

    historyEntries.forEach(entry => {
      const date = new Date(entry.lastUsed)
      const hour = date.getHours()
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
      dayMap.set(day, (dayMap.get(day) || 0) + 1)
      
      if (!sessions.has(entry.sessionId)) {
        sessions.set(entry.sessionId, [])
      }
      sessions.get(entry.sessionId)!.push(date)
    })

    const mostActiveHour = Array.from(hourMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0
    
    const mostActiveDay = Array.from(dayMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday'

    const sessionLengths = Array.from(sessions.values())
      .map(dates => {
        if (dates.length < 2) return 0
        const sorted = dates.sort((a, b) => a.getTime() - b.getTime())
        return sorted[sorted.length - 1].getTime() - sorted[0].getTime()
      })
      .filter(length => length > 0)
    
    const averageSessionLength = sessionLengths.length > 0 
      ? sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length / (1000 * 60)
      : 0

    return {
      totalUsage: historyEntries.length,
      dailyUsage,
      weeklyUsage,
      monthlyUsage,
      categoryUsage,
      typeUsage,
      topItems,
      favoriteStats: {
        totalFavorites: favorites.length,
        favoritesByType,
        favoritesByCategory
      },
      timeStats: {
        mostActiveHour,
        mostActiveDay,
        averageSessionLength
      }
    }
  }, [historyEntries])

  // Update statistics when calculated values change
  useEffect(() => {
    setStatistics(calculatedStatistics)
  }, [calculatedStatistics])

  // Record usage
  const recordUsage = (item: Prompt | PromptGroup | PromptChain, isFavorite = false) => {
    const getTitle = (item: Prompt | PromptGroup | PromptChain): string => {
      if ('title' in item) return item.title
      if ('name' in item) return item.name
      return 'Unknown'
    }

    const getType = (item: Prompt | PromptGroup | PromptChain): 'prompt' | 'group' | 'chain' => {
      if ('content' in item) return 'prompt'
      if ('prompts' in item) return 'group'
      return 'chain'
    }

    const getCategory = (item: Prompt | PromptGroup | PromptChain): string => {
      if ('category' in item) return item.category
      return 'general'
    }

    const entry: HistoryEntry = {
      id: item.id,
      type: getType(item),
      title: getTitle(item),
      category: getCategory(item),
      lastUsed: new Date(),
      sessionId: currentSessionId,
      isFavorite
    }

    const newEntries = [...historyEntries, entry]
    setHistoryEntries(newEntries)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: newEntries }))
      } catch (error) {
        console.error('Error saving statistics:', error)
      }
    }
  }

  // Export statistics
  const exportStatistics = () => {
    const data = {
      statistics: calculatedStatistics,
      historyEntries,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(data, null, 2)
  }

  // Clear statistics
  const clearStatistics = () => {
    setHistoryEntries([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    statistics: calculatedStatistics,
    recordUsage,
    exportStatistics,
    clearStatistics
  }
}

export type { UsageStatistics, HistoryEntry }