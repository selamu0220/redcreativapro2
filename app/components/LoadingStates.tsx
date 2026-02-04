'use client'

import React from 'react'
import { Loader2, FileText, Users, Link } from 'lucide-react'
import './ui/mobile-optimizations.css'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  )
}

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <LoadingSpinner 
          size={size === 'lg' ? 'md' : 'sm'} 
          className="mr-2" 
        />
      )}
      {children}
    </button>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ 
  title = 'Cargando...', 
  description,
  className = '' 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={`bg-gray-200 dark:bg-gray-700 rounded h-4 ${index > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </div>
  )
}

interface LoadingListProps {
  itemCount?: number
  showIcon?: boolean
  className?: string
}

export const LoadingList: React.FC<LoadingListProps> = ({ 
  itemCount = 5, 
  showIcon = true,
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {showIcon && (
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface LoadingStateProps {
  type: 'prompts' | 'groups' | 'chains' | 'general'
  message?: string
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  type, 
  message,
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'prompts':
        return <FileText className="w-12 h-12 text-gray-400" />
      case 'groups':
        return <Users className="w-12 h-12 text-gray-400" />
      case 'chains':
        return <Link className="w-12 h-12 text-gray-400" />
      default:
        return <LoadingSpinner size="lg" className="text-blue-600" />
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'prompts':
        return 'Cargando prompts...'
      case 'groups':
        return 'Cargando grupos...'
      case 'chains':
        return 'Cargando cadenas...'
      default:
        return 'Cargando...'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="mb-4">
        {getIcon()}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        {message || getDefaultMessage()}
      </p>
    </div>
  )
}

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label,
  showPercentage = true,
  className = '' 
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-bar-fill"
          data-progress={Math.round(clampedProgress)}
        />
      </div>
    </div>
  )
}

// Hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState)
  const [error, setError] = React.useState<string | null>(null)

  const startLoading = React.useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const stopLoading = React.useCallback(() => {
    setLoading(false)
  }, [])

  const setLoadingError = React.useCallback((errorMessage: string) => {
    setLoading(false)
    setError(errorMessage)
  }, [])

  const reset = React.useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset
  }
}
