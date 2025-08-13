export interface RetryOptions {
  maxRetries: number
  backoffMultiplier: number
  initialDelay: number
  maxDelay: number
}

export enum ChunkErrorType {
  LOAD_FAILED = 'LOAD_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CACHE_MISMATCH = 'CACHE_MISMATCH',
  BUILD_MISMATCH = 'BUILD_MISMATCH'
}

export interface ChunkError {
  type: ChunkErrorType
  chunkName: string
  url: string
  timestamp: number
  userAgent: string
  retryAttempts: number
}

export class ChunkLoadManager {
  private static instance: ChunkLoadManager
  private retryAttempts = new Map<string, number>()
  
  static getInstance(): ChunkLoadManager {
    if (!ChunkLoadManager.instance) {
      ChunkLoadManager.instance = new ChunkLoadManager()
    }
    return ChunkLoadManager.instance
  }

  async retryChunkLoad(chunkUrl: string, options: RetryOptions = {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    maxDelay: 10000
  }): Promise<void> {
    const attempts = this.retryAttempts.get(chunkUrl) || 0
    
    if (attempts >= options.maxRetries) {
      throw new Error(`Max retries exceeded for chunk: ${chunkUrl}`)
    }

    this.retryAttempts.set(chunkUrl, attempts + 1)
    
    const delay = Math.min(
      options.initialDelay * Math.pow(options.backoffMultiplier, attempts),
      options.maxDelay
    )

    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      // Try to load the chunk with cache busting
      const cacheBustedUrl = this.addCacheBuster(chunkUrl)
      await this.loadScript(cacheBustedUrl)
      
      // Reset retry count on success
      this.retryAttempts.delete(chunkUrl)
    } catch (error) {
      console.warn(`Chunk retry ${attempts + 1}/${options.maxRetries} failed for ${chunkUrl}:`, error)
      throw error
    }
  }

  private addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}v=${Date.now()}&retry=true`
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
      document.head.appendChild(script)
    })
  }

  clearChunkCache(chunkName?: string): void {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (!chunkName || cacheName.includes(chunkName)) {
            caches.delete(cacheName)
          }
        })
      })
    }
    
    // Clear retry attempts
    if (chunkName) {
      for (const [url] of this.retryAttempts) {
        if (url.includes(chunkName)) {
          this.retryAttempts.delete(url)
        }
      }
    } else {
      this.retryAttempts.clear()
    }
  }

  detectStaleChunks(): string[] {
    const staleChunks: string[] = []
    
    // Check for scripts with old version parameters
    const scripts = document.querySelectorAll('script[src*="_next/static/chunks"]')
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src
      if (src && this.isStaleChunk(src)) {
        staleChunks.push(src)
      }
    })
    
    return staleChunks
  }

  private isStaleChunk(url: string): boolean {
    // Simple heuristic: if chunk has old timestamp or no version
    const urlParams = new URLSearchParams(url.split('?')[1] || '')
    const version = urlParams.get('v')
    
    if (!version) return true
    
    const chunkTime = parseInt(version)
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    return (now - chunkTime) > oneHour
  }

  classifyError(error: Error): ChunkErrorType {
    const message = error.message.toLowerCase()
    
    if (message.includes('loading chunk') || message.includes('chunkloaderror')) {
      return ChunkErrorType.LOAD_FAILED
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return ChunkErrorType.NETWORK_ERROR
    }
    
    if (message.includes('cache') || message.includes('version')) {
      return ChunkErrorType.CACHE_MISMATCH
    }
    
    return ChunkErrorType.BUILD_MISMATCH
  }

  async preloadCriticalChunks(): Promise<void> {
    // Preload essential chunks that are likely to be needed
    const criticalChunks = [
      '/_next/static/chunks/pages/_app.js',
      '/_next/static/chunks/main.js'
    ]

    const preloadPromises = criticalChunks.map(chunk => {
      return new Promise<void>((resolve) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'script'
        link.href = chunk
        link.onload = () => resolve()
        link.onerror = () => resolve() // Don't fail preloading
        document.head.appendChild(link)
      })
    })

    await Promise.allSettled(preloadPromises)
  }
}

// Global error handler for chunk loading errors
export function setupChunkErrorHandler(): void {
  if (typeof window === 'undefined') return

  const chunkManager = ChunkLoadManager.getInstance()
  
  // Override webpack's chunk loading error handler
  const originalOnError = window.onerror
  window.onerror = (message, source, lineno, colno, error) => {
    if (error && error.name === 'ChunkLoadError') {
      console.warn('ChunkLoadError detected, attempting recovery:', error)
      
      // Try to extract chunk URL from error
      const chunkUrl = source || ''
      if (chunkUrl.includes('_next/static/chunks')) {
        chunkManager.retryChunkLoad(chunkUrl).catch(retryError => {
          console.error('Chunk retry failed:', retryError)
          // Fallback to page reload
          window.location.reload()
        })
        return true // Prevent default error handling
      }
    }
    
    return originalOnError ? originalOnError(message, source, lineno, colno, error) : false
  }

  // Handle unhandled promise rejections (common with chunk loading)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    if (error && (error.message?.includes('Loading chunk') || error.name === 'ChunkLoadError')) {
      console.warn('Unhandled chunk loading rejection:', error)
      event.preventDefault()
      
      // Attempt recovery
      chunkManager.clearChunkCache()
      setTimeout(() => window.location.reload(), 1000)
    }
  })
}