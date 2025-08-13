'use client'

import React from 'react'
import { ChunkLoadManager, ChunkErrorType } from '../lib/chunk-manager'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorType: 'chunk' | 'network' | 'generic'
  retryCount: number
  isRetrying: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  maxRetries?: number
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private chunkManager = ChunkLoadManager.getInstance()

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false,
      errorType: 'generic',
      retryCount: 0,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.name === 'ChunkLoadError' ||
                        error.message?.includes('ChunkLoadError')
    
    return { 
      hasError: true, 
      error,
      errorType: isChunkError ? 'chunk' : 'generic',
      retryCount: 0,
      isRetrying: false
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Auto-retry for chunk errors
    if (this.state.errorType === 'chunk' && this.state.retryCount === 0) {
      this.handleChunkErrorRetry()
    }
  }

  handleChunkErrorRetry = async () => {
    const maxRetries = this.props.maxRetries || 2
    
    if (this.state.retryCount >= maxRetries) {
      return
    }

    this.setState({ isRetrying: true })

    try {
      // Clear chunk cache and retry
      this.chunkManager.clearChunkCache()
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset error state to retry rendering
      this.setState({ 
        hasError: false, 
        error: undefined,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      })
    } catch (retryError) {
      console.error('Chunk retry failed:', retryError)
      this.setState({ 
        isRetrying: false,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  handleManualRetry = () => {
    this.handleChunkErrorRetry()
  }

  handleHardRefresh = () => {
    // Clear all caches and reload
    this.chunkManager.clearChunkCache()
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      }).finally(() => {
        if (typeof window !== 'undefined') {
          (window as any).location.reload()
        }
      })
    } else {
      if (typeof window !== 'undefined') {
        (window as any).location.reload()
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isRetrying) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Reintentando cargar...
              </h2>
              <p className="text-muted-foreground">
                Solucionando el problema de carga
              </p>
            </div>
          </div>
        )
      }

      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="mb-6">
              {this.state.errorType === 'chunk' ? (
                <div className="text-6xl mb-4">🔧</div>
              ) : (
                <div className="text-6xl mb-4">⚠️</div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {this.state.errorType === 'chunk' 
                ? 'Error de carga de recursos'
                : 'Algo salió mal'
              }
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {this.state.errorType === 'chunk'
                ? 'Hubo un problema cargando parte de la aplicación. Esto suele solucionarse fácilmente.'
                : 'Ha ocurrido un error inesperado. Por favor, recarga la página.'
              }
            </p>

            <div className="space-y-3">
              {this.state.errorType === 'chunk' && this.state.retryCount < (this.props.maxRetries || 2) && (
                <button
                  type="button"
                  onClick={this.handleManualRetry}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  🔄 Reintentar
                </button>
              )}
              
              <button
                type="button"
                onClick={this.handleHardRefresh}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                🔃 Recargar página
              </button>
            </div>

            {this.state.errorType === 'chunk' && (
              <p className="text-xs text-muted-foreground mt-4">
                Intentos: {this.state.retryCount}/{this.props.maxRetries || 2}
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary