'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface PromptsErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface PromptsErrorBoundaryProps {
  children: React.ReactNode
}

export class PromptsErrorBoundary extends React.Component<
  PromptsErrorBoundaryProps,
  PromptsErrorBoundaryState
> {
  constructor(props: PromptsErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<PromptsErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 PromptsErrorBoundary caught an error:', error)
    console.error('Error info:', errorInfo)
    
    // Log detailed error information
    console.error('Stack trace:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      
      // Determine error type for better messaging
      let errorMessage = 'Ha ocurrido un error inesperado'
      let suggestions: string[] = []

      if (error?.message) {
        if (error.message.includes('localeCompare')) {
          errorMessage = 'Error en la ordenación de prompts'
          suggestions = [
            'Los datos pueden estar corruptos',
            'Intenta recargar la página',
            'Verifica tu conexión a internet'
          ]
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Error de conexión'
          suggestions = [
            'Verifica tu conexión a internet',
            'El servidor puede estar temporalmente no disponible',
            'Intenta recargar la página en unos momentos'
          ]
        } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
          errorMessage = 'Error de autenticación'
          suggestions = [
            'Tu sesión puede haber expirado',
            'Intenta cerrar sesión e iniciar sesión nuevamente',
            'Verifica tus credenciales'
          ]
        } else if (error.message.includes('undefined') || error.message.includes('null')) {
          errorMessage = 'Error en los datos'
          suggestions = [
            'Los datos pueden estar incompletos',
            'Intenta recargar la página',
            'Limpia el caché del navegador'
          ]
        }
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-white mb-2">
                ¡Oops! Algo salió mal
              </h1>
              <p className="text-gray-300 text-sm mb-4">
                {errorMessage}
              </p>
              
              {suggestions.length > 0 && (
                <div className="text-left bg-gray-900/50 rounded-lg p-3 mb-4">
                  <p className="text-gray-400 text-xs font-medium mb-2">Posibles soluciones:</p>
                  <ul className="text-gray-300 text-xs space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar página
              </button>
              
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-gray-400 text-xs flex items-center gap-1">
                  <Bug className="w-3 h-3" />
                  Detalles técnicos (desarrollo)
                </summary>
                <div className="mt-2 bg-gray-900 rounded p-2 text-xs text-red-300 font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default PromptsErrorBoundary
