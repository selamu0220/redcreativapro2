'use client'

import { useEffect } from 'react'

export default function ClientErrorHandler() {
  useEffect(() => {
    // Handle webpack factory function errors
    const originalOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      // Handle webpack factory function errors
      if (typeof message === 'string' && message.includes('Cannot read properties of undefined')) {
        console.warn('Webpack factory function error detected, reloading page')
        setTimeout(() => window.location.reload(), 100)
        return true
      }
      
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false
    }

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      if (error && (error.message?.includes('Loading chunk') || error.name === 'ChunkLoadError')) {
        console.warn('Unhandled chunk loading rejection:', error)
        event.preventDefault()
        setTimeout(() => window.location.reload(), 1000)
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.onerror = originalOnError
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
