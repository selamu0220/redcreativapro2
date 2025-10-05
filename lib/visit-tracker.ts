'use client'

export interface VisitData {
  articleId: string
  title: string
  visits: number
  lastVisit: string
  firstVisit: string
}

export interface VisitStats {
  totalVisits: number
  totalArticles: number
  averageVisitsPerArticle: number
  mostVisitedArticle: VisitData | null
  recentVisits: VisitData[]
}

const STORAGE_KEY = 'blog_visit_tracker'

export class VisitTracker {
  private static instance: VisitTracker
  private visits: Map<string, VisitData> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): VisitTracker {
    if (!VisitTracker.instance) {
      VisitTracker.instance = new VisitTracker()
    }
    return VisitTracker.instance
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.visits = new Map(Object.entries(data))
      }
    } catch (error) {
      console.error('Error loading visit data:', error)
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const data = Object.fromEntries(this.visits)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving visit data:', error)
    }
  }

  trackVisit(articleId: string, title: string): void {
    const now = new Date().toISOString()
    const existing = this.visits.get(articleId)

    if (existing) {
      existing.visits += 1
      existing.lastVisit = now
    } else {
      this.visits.set(articleId, {
        articleId,
        title,
        visits: 1,
        lastVisit: now,
        firstVisit: now
      })
    }

    this.saveToStorage()
  }

  getVisitData(articleId: string): VisitData | null {
    return this.visits.get(articleId) || null
  }

  getAllVisits(): VisitData[] {
    return Array.from(this.visits.values()).sort((a, b) => b.visits - a.visits)
  }

  getStats(): VisitStats {
    const allVisits = this.getAllVisits()
    const totalVisits = allVisits.reduce((sum, visit) => sum + visit.visits, 0)
    const totalArticles = allVisits.length
    const averageVisitsPerArticle = totalArticles > 0 ? totalVisits / totalArticles : 0
    const mostVisitedArticle = allVisits.length > 0 ? allVisits[0] : null
    const recentVisits = allVisits
      .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
      .slice(0, 10)

    return {
      totalVisits,
      totalArticles,
      averageVisitsPerArticle,
      mostVisitedArticle,
      recentVisits
    }
  }

  exportData(): string {
    const data = {
      exportDate: new Date().toISOString(),
      stats: this.getStats(),
      visits: this.getAllVisits()
    }
    return JSON.stringify(data, null, 2)
  }

  clearData(): void {
    this.visits.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

// Hook para usar en componentes React
export function useVisitTracker() {
  const tracker = VisitTracker.getInstance()

  const trackVisit = (articleId: string, title: string) => {
    tracker.trackVisit(articleId, title)
  }

  const getVisitData = (articleId: string) => {
    return tracker.getVisitData(articleId)
  }

  const getAllVisits = () => {
    return tracker.getAllVisits()
  }

  const getStats = () => {
    return tracker.getStats()
  }

  const exportData = () => {
    return tracker.exportData()
  }

  const clearData = () => {
    tracker.clearData()
  }

  return {
    trackVisit,
    getVisitData,
    getAllVisits,
    getStats,
    exportData,
    clearData
  }
}