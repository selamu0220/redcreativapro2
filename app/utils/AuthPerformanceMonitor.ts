// Tipos para métricas de rendimiento
export interface AuthPerformanceMetrics {
  // Métricas de tiempo
  authInitTime: number
  subscriptionCheckTime: number
  totalAuthTime: number
  
  // Métricas de caché
  cacheHits: number
  cacheMisses: number
  cacheSize: number
  
  // Métricas de errores
  errors: number
  errorTypes: Record<string, number>
  
  // Métricas de red
  apiCalls: number
  averageResponseTime: number
  
  // Métricas de usuario
  sessionDuration: number
  lastActivity: number
  
  // Timestamps
  startTime: number
  lastUpdate: number
}

export interface PerformanceEvent {
  type: 'auth_start' | 'auth_complete' | 'subscription_check' | 'cache_hit' | 'cache_miss' | 'error' | 'api_call'
  timestamp: number
  duration?: number
  metadata?: Record<string, any>
}

// Singleton para monitoreo de rendimiento
class AuthPerformanceMonitor {
  private static instance: AuthPerformanceMonitor
  private metrics: AuthPerformanceMetrics
  private events: PerformanceEvent[] = []
  private maxEvents = 1000 // Limitar eventos para evitar memory leaks
  private subscribers: ((metrics: AuthPerformanceMetrics) => void)[] = []
  
  private constructor() {
    this.metrics = this.initializeMetrics()
    this.startPerformanceObserver()
  }
  
  public static getInstance(): AuthPerformanceMonitor {
    if (!AuthPerformanceMonitor.instance) {
      AuthPerformanceMonitor.instance = new AuthPerformanceMonitor()
    }
    return AuthPerformanceMonitor.instance
  }
  
  private initializeMetrics(): AuthPerformanceMetrics {
    return {
      authInitTime: 0,
      subscriptionCheckTime: 0,
      totalAuthTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheSize: 0,
      errors: 0,
      errorTypes: {},
      apiCalls: 0,
      averageResponseTime: 0,
      sessionDuration: 0,
      lastActivity: Date.now(),
      startTime: Date.now(),
      lastUpdate: Date.now()
    }
  }
  
  private startPerformanceObserver() {
    if (typeof window === 'undefined') return
    
    // Observer para Navigation Timing API
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('auth') || entry.name.includes('subscription')) {
              this.recordEvent({
                type: 'api_call',
                timestamp: Date.now(),
                duration: entry.duration,
                metadata: { name: entry.name, type: entry.entryType }
              })
            }
          }
        })
        
        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
      } catch (error) {
        console.warn('Performance Observer not supported:', error)
      }
    }
    
    // Actualizar duración de sesión cada minuto
    setInterval(() => {
      this.updateSessionDuration()
    }, 60000)
  }
  
  // Registrar eventos de rendimiento
  public recordEvent(event: PerformanceEvent) {
    this.events.push(event)
    
    // Mantener solo los últimos N eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
    
    this.updateMetrics(event)
    this.notifySubscribers()
  }
  
  private updateMetrics(event: PerformanceEvent) {
    const now = Date.now()
    this.metrics.lastUpdate = now
    this.metrics.lastActivity = now
    
    switch (event.type) {
      case 'auth_start':
        this.metrics.startTime = event.timestamp
        break
        
      case 'auth_complete':
        if (event.duration) {
          this.metrics.authInitTime = event.duration
          this.metrics.totalAuthTime += event.duration
        }
        break
        
      case 'subscription_check':
        if (event.duration) {
          this.metrics.subscriptionCheckTime = event.duration
        }
        break
        
      case 'cache_hit':
        this.metrics.cacheHits++
        break
        
      case 'cache_miss':
        this.metrics.cacheMisses++
        break
        
      case 'error':
        this.metrics.errors++
        const errorType = event.metadata?.type || 'unknown'
        this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1
        break
        
      case 'api_call':
        this.metrics.apiCalls++
        if (event.duration) {
          // Calcular promedio móvil de tiempo de respuesta
          const currentAvg = this.metrics.averageResponseTime
          const count = this.metrics.apiCalls
          this.metrics.averageResponseTime = ((currentAvg * (count - 1)) + event.duration) / count
        }
        break
    }
  }
  
  private updateSessionDuration() {
    this.metrics.sessionDuration = Date.now() - this.metrics.startTime
  }
  
  // Suscribirse a cambios de métricas
  public subscribe(callback: (metrics: AuthPerformanceMetrics) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }
  
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback({ ...this.metrics })
      } catch (error) {
        console.error('Error notifying performance subscriber:', error)
      }
    })
  }
  
  // Obtener métricas actuales
  public getMetrics(): AuthPerformanceMetrics {
    this.updateSessionDuration()
    return { ...this.metrics }
  }
  
  // Obtener eventos recientes
  public getRecentEvents(limit = 50): PerformanceEvent[] {
    return this.events.slice(-limit)
  }
  
  // Obtener estadísticas de rendimiento
  public getPerformanceStats() {
    const metrics = this.getMetrics()
    const totalCacheRequests = metrics.cacheHits + metrics.cacheMisses
    
    return {
      // Ratios de rendimiento
      cacheHitRate: totalCacheRequests > 0 ? (metrics.cacheHits / totalCacheRequests) * 100 : 0,
      errorRate: metrics.apiCalls > 0 ? (metrics.errors / metrics.apiCalls) * 100 : 0,
      
      // Clasificación de rendimiento
      authPerformance: this.classifyPerformance(metrics.authInitTime, [500, 1000, 2000]),
      subscriptionPerformance: this.classifyPerformance(metrics.subscriptionCheckTime, [200, 500, 1000]),
      
      // Tendencias
      recentErrors: this.getRecentEvents(20).filter(e => e.type === 'error').length,
      recentApiCalls: this.getRecentEvents(20).filter(e => e.type === 'api_call').length,
      
      // Métricas brutas
      ...metrics
    }
  }
  
  private classifyPerformance(time: number, thresholds: number[]): 'excellent' | 'good' | 'fair' | 'poor' {
    if (time <= thresholds[0]) return 'excellent'
    if (time <= thresholds[1]) return 'good'
    if (time <= thresholds[2]) return 'fair'
    return 'poor'
  }
  
  // Resetear métricas
  public reset() {
    this.metrics = this.initializeMetrics()
    this.events = []
    this.notifySubscribers()
  }
  
  // Exportar métricas para análisis
  public exportMetrics() {
    return {
      metrics: this.getMetrics(),
      events: this.events,
      stats: this.getPerformanceStats(),
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    }
  }
  
  // Generar reporte de rendimiento
  public generateReport(): string {
    const stats = this.getPerformanceStats()
    const report = [
      '=== AUTH PERFORMANCE REPORT ===',
      `Generated: ${new Date().toISOString()}`,
      '',
      '--- Authentication Metrics ---',
      `Auth Init Time: ${stats.authInitTime}ms (${stats.authPerformance})`,
      `Subscription Check: ${stats.subscriptionCheckTime}ms (${stats.subscriptionPerformance})`,
      `Total Auth Time: ${stats.totalAuthTime}ms`,
      '',
      '--- Cache Performance ---',
      `Cache Hit Rate: ${stats.cacheHitRate.toFixed(1)}%`,
      `Cache Hits: ${stats.cacheHits}`,
      `Cache Misses: ${stats.cacheMisses}`,
      '',
      '--- API Performance ---',
      `Total API Calls: ${stats.apiCalls}`,
      `Average Response Time: ${stats.averageResponseTime.toFixed(1)}ms`,
      `Error Rate: ${stats.errorRate.toFixed(1)}%`,
      '',
      '--- Session Info ---',
      `Session Duration: ${(stats.sessionDuration / 1000 / 60).toFixed(1)} minutes`,
      `Last Activity: ${new Date(stats.lastActivity).toLocaleTimeString()}`,
      '',
      '--- Error Breakdown ---'
    ]
    
    Object.entries(stats.errorTypes).forEach(([type, count]) => {
      report.push(`${type}: ${count}`)
    })
    
    return report.join('\n')
  }
}

// Funciones de utilidad para usar en componentes
export const performanceMonitor = AuthPerformanceMonitor.getInstance()

// Hook para usar métricas en componentes React
export function useAuthPerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<AuthPerformanceMetrics>(
    performanceMonitor.getMetrics()
  )
  
  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setMetrics)
    return unsubscribe
  }, [])
  
  return {
    metrics,
    stats: performanceMonitor.getPerformanceStats(),
    recordEvent: (event: PerformanceEvent) => performanceMonitor.recordEvent(event),
    reset: () => performanceMonitor.reset(),
    exportMetrics: () => performanceMonitor.exportMetrics(),
    generateReport: () => performanceMonitor.generateReport()
  }
}

// Funciones de conveniencia para registrar eventos comunes
export const recordAuthStart = () => {
  performanceMonitor.recordEvent({
    type: 'auth_start',
    timestamp: Date.now()
  })
}

export const recordAuthComplete = (duration: number) => {
  performanceMonitor.recordEvent({
    type: 'auth_complete',
    timestamp: Date.now(),
    duration
  })
}

export const recordSubscriptionCheck = (duration: number) => {
  performanceMonitor.recordEvent({
    type: 'subscription_check',
    timestamp: Date.now(),
    duration
  })
}

export const recordCacheHit = (key?: string) => {
  performanceMonitor.recordEvent({
    type: 'cache_hit',
    timestamp: Date.now(),
    metadata: { key }
  })
}

export const recordCacheMiss = (key?: string) => {
  performanceMonitor.recordEvent({
    type: 'cache_miss',
    timestamp: Date.now(),
    metadata: { key }
  })
}

export const recordError = (error: string, type?: string) => {
  performanceMonitor.recordEvent({
    type: 'error',
    timestamp: Date.now(),
    metadata: { error, type }
  })
}

export const recordApiCall = (duration: number, endpoint?: string) => {
  performanceMonitor.recordEvent({
    type: 'api_call',
    timestamp: Date.now(),
    duration,
    metadata: { endpoint }
  })
}

// Importar React para el hook
import React from 'react'
