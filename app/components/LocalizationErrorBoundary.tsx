'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackCountry?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

/**
 * Error boundary specifically for localization-related errors
 * Provides graceful fallback when geo-detection or localization fails
 */
export class LocalizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Localization Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Clear any cached localization data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redcreativa-geo-detection')
      localStorage.removeItem('redcreativa-manual-country')
    }
    // Reload the page to reinitialize localization
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Error de Localización</CardTitle>
              <CardDescription>
                Hubo un problema al detectar tu ubicación y configuración regional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>País por defecto:</strong> {this.props.fallbackCountry || 'México'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Moneda:</strong> USD (internacional)
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar Detección
                </Button>
                
                <Button 
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null })
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Continuar sin Localización
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-600 cursor-pointer">
                    Detalles del error (desarrollo)
                  </summary>
                  <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook version of the error boundary for functional components
 */
export function useLocalizationErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Localization error:', error)
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const retryLocalization = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redcreativa-geo-detection')
      localStorage.removeItem('redcreativa-manual-country')
    }
    clearError()
    window.location.reload()
  }, [clearError])

  return {
    error,
    handleError,
    clearError,
    retryLocalization
  }
}