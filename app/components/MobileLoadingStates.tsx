'use client'

import { useState, useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'

// Componente de loading optimizado para móvil
export function MobileOptimizedLoader({
  size = 'md',
  variant = 'spinner',
  text = '',
  fullScreen = false,
  overlay = false,
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
  className?: string
}) {
  const { isMobile } = useViewport()
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const LoaderContent = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`} />
        )
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`bg-primary rounded-full animate-pulse ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'}`}
                data-delay={i}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div className={`bg-primary rounded-full animate-pulse ${sizeClasses[size]}`} />
        )
      
      case 'skeleton':
        return (
          <div className="space-y-2 w-full max-w-sm">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        )
      
      case 'progress':
        return (
          <div className="w-full max-w-sm">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-progress" />
            </div>
          </div>
        )
      
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`} />
        )
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <LoaderContent />
      {text && (
        <p className={`text-muted-foreground text-center ${textSizeClasses[size]} ${isMobile ? 'px-4' : ''}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

// Componente de estado vacío optimizado para móvil
export function MobileEmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  const { isMobile } = useViewport()

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className={`mb-4 text-muted-foreground ${isMobile ? 'text-6xl' : 'text-5xl'}`}>
          {icon}
        </div>
      )}
      
      <h3 className={`font-semibold text-foreground mb-2 ${isMobile ? 'text-lg' : 'text-base'}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-muted-foreground mb-6 max-w-sm ${isMobile ? 'text-base' : 'text-sm'}`}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {action}
        </div>
      )}
    </div>
  )
}

// Componente de estado de error optimizado para móvil
export function MobileErrorState({
  title = 'Algo salió mal',
  description = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
  onRetry,
  retryText = 'Reintentar',
  showDetails = false,
  error,
  className = ''
}: {
  title?: string
  description?: string
  onRetry?: () => void
  retryText?: string
  showDetails?: boolean
  error?: Error | string
  className?: string
}) {
  const { isMobile } = useViewport()
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {/* Icono de error */}
      <div className={`mb-4 text-destructive ${isMobile ? 'text-6xl' : 'text-5xl'}`}>
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
          />
        </svg>
      </div>
      
      <h3 className={`font-semibold text-foreground mb-2 ${isMobile ? 'text-lg' : 'text-base'}`}>
        {title}
      </h3>
      
      <p className={`text-muted-foreground mb-6 max-w-sm ${isMobile ? 'text-base' : 'text-sm'}`}>
        {description}
      </p>
      
      {/* Botones de acción */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              w-full px-4 py-3 bg-primary text-primary-foreground
              rounded-lg font-medium transition-all duration-200
              hover:bg-primary/90 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            "
          >
            {retryText}
          </button>
        )}
        
        {showDetails && errorMessage && (
          <button
            type="button"
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="
              w-full px-4 py-2 text-muted-foreground
              border border-border rounded-lg
              transition-all duration-200
              hover:bg-muted active:scale-95
            "
          >
            {showErrorDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        )}
      </div>
      
      {/* Detalles del error */}
      {showErrorDetails && errorMessage && (
        <div className="mt-6 w-full max-w-md">
          <div className="p-4 bg-muted rounded-lg text-left">
            <h4 className="font-medium text-sm mb-2">Detalles del error:</h4>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {errorMessage}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de progreso de carga con pasos
export function MobileProgressSteps({
  steps,
  currentStep,
  className = ''
}: {
  steps: string[]
  currentStep: number
  className?: string
}) {
  const { isMobile } = useViewport()

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Paso {currentStep + 1} de {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            data-progress={((currentStep + 1) / steps.length) * 100}
          />
        </div>
      </div>
      
      {/* Lista de pasos */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep
          
          return (
            <div key={index} className="flex items-center gap-3">
              {/* Indicador de estado */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isCompleted 
                  ? 'bg-primary text-primary-foreground' 
                  : isCurrent 
                    ? 'bg-primary/20 border-2 border-primary' 
                    : 'bg-muted border-2 border-muted-foreground/20'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                ) : (
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
                )}
              </div>
              
              {/* Texto del paso */}
              <span className={`
                ${isMobile ? 'text-sm' : 'text-xs'}
                transition-colors duration-300
                ${isCompleted 
                  ? 'text-foreground line-through' 
                  : isCurrent 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                }
              `}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Hook para manejar estados de carga
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [error, setError] = useState<Error | string | null>(null)
  const [progress, setProgress] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  const startLoading = () => {
    setIsLoading(true)
    setError(null)
    setProgress(0)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setProgress(100)
  }

  const setLoadingError = (err: Error | string) => {
    setIsLoading(false)
    setError(err)
  }

  const updateProgress = (value: number) => {
    setProgress(Math.max(0, Math.min(100, value)))
  }

  // Auto-incrementar progreso
  const startAutoProgress = (duration = 5000) => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current)
    }
    
    const increment = 100 / (duration / 100)
    let currentProgress = 0
    
    timeoutRef.current = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 90) {
        if (timeoutRef.current) clearInterval(timeoutRef.current)
        setProgress(90) // Dejar en 90% hasta completar manualmente
      } else {
        setProgress(currentProgress)
      }
    }, 100) as unknown as number
  }

  const stopAutoProgress = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current)
      }
    }
  }, [])

  return {
    isLoading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    updateProgress,
    startAutoProgress,
    stopAutoProgress
  }
}
