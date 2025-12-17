'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useViewport } from '../hooks/useViewport'

// Componente para formularios optimizados para móvil
export function MobileOptimizedForm({
  children,
  onSubmit,
  className = '',
  autoComplete = 'on',
  noValidate = false
}: {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
  autoComplete?: string
  noValidate?: boolean
}) {
  const { isMobile } = useViewport()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Detectar teclado virtual
  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.screen.height
      const heightDifference = windowHeight - viewportHeight
      
      setIsKeyboardOpen(heightDifference > 150)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [isMobile])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Ocultar teclado en móvil al enviar
    if (isMobile && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    
    onSubmit?.(e)
  }, [isMobile, onSubmit])

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      autoComplete={autoComplete}
      noValidate={noValidate}
      className={`mobile-optimized-form ${isKeyboardOpen ? 'keyboard-open' : ''} ${className}`}
    >
      {children}
    </form>
  )
}

// Input optimizado para móvil con mejor UX
export function MobileOptimizedInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  errorMessage = '',
  label = '',
  autoComplete = 'off',
  inputMode,
  pattern,
  maxLength,
  className = '',
  ...props
}: {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  autoComplete?: string
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  pattern?: string
  maxLength?: number
  className?: string
  [key: string]: any
}) {
  const { isMobile } = useViewport()
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHasValue(!!value)
  }, [value])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
    
    // Scroll al input en móvil para evitar que quede oculto por el teclado
    if (isMobile && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 300)
    }
  }, [isMobile, onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value)
    onChange?.(e)
  }, [onChange])

  // Determinar inputMode automáticamente si no se especifica
  const getInputMode = () => {
    if (inputMode) return inputMode
    
    switch (type) {
      case 'email': return 'email'
      case 'tel': return 'tel'
      case 'url': return 'url'
      case 'number': return 'numeric'
      case 'search': return 'search'
      default: return 'text'
    }
  }

  const inputClasses = [
    'mobile-optimized-input',
    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    isMobile ? 'h-14 px-4 text-base' : 'h-10',
    error ? 'border-destructive focus-visible:ring-destructive' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="mobile-input-container relative">
      {label && (
        <label 
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            isFocused || hasValue 
              ? 'top-2 text-xs text-primary' 
              : `${isMobile ? 'top-4 text-base' : 'top-3 text-sm'} text-muted-foreground`
          }`}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={inputRef}
        type={type}
        placeholder={isFocused || !label ? placeholder : ''}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        inputMode={getInputMode()}
        pattern={pattern}
        maxLength={maxLength}
        className={inputClasses}
        {...props}
      />
      
      {error && errorMessage && (
        <div className="mt-2 text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}
    </div>
  )
}

// Textarea optimizado para móvil
export function MobileOptimizedTextarea({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  errorMessage = '',
  label = '',
  rows = 4,
  maxLength,
  autoResize = true,
  className = '',
  ...props
}: {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  rows?: number
  maxLength?: number
  autoResize?: boolean
  className?: string
  [key: string]: any
}) {
  const { isMobile } = useViewport()
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setHasValue(!!value)
  }, [value])

  // Auto-resize del textarea
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value, autoResize])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
    
    // Scroll al textarea en móvil
    if (isMobile && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 300)
    }
  }, [isMobile, onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(!!e.target.value)
    onChange?.(e)
  }, [onChange])

  const textareaClasses = [
    'mobile-optimized-textarea',
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
    isMobile ? 'p-4 text-base min-h-[120px]' : 'min-h-[100px]',
    error ? 'border-destructive focus-visible:ring-destructive' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="mobile-textarea-container relative">
      {label && (
        <label 
          className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
            isFocused || hasValue 
              ? 'top-2 text-xs text-primary bg-background px-1' 
              : `${isMobile ? 'top-4 text-base' : 'top-3 text-sm'} text-muted-foreground`
          }`}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={textareaRef}
        placeholder={isFocused || !label ? placeholder : ''}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        {...props}
      />
      
      {maxLength && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          {value?.length || 0}/{maxLength}
        </div>
      )}
      
      {error && errorMessage && (
        <div className="mt-2 text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}
    </div>
  )
}

// Select optimizado para móvil
export function MobileOptimizedSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  required = false,
  error = false,
  errorMessage = '',
  label = '',
  className = '',
  ...props
}: {
  options: { value: string; label: string; disabled?: boolean }[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  className?: string
  [key: string]: any
}) {
  const { isMobile } = useViewport()
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(!!value)
  }, [value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    setHasValue(!!newValue)
    onChange?.(newValue)
  }, [onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const selectClasses = [
    'mobile-optimized-select',
    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
    isMobile ? 'h-14 px-4 pr-10 text-base' : 'pr-8',
    error ? 'border-destructive focus-visible:ring-destructive' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="mobile-select-container relative">
      {label && (
        <label 
          className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
            isFocused || hasValue 
              ? 'top-2 text-xs text-primary bg-background px-1' 
              : `${isMobile ? 'top-4 text-base' : 'top-3 text-sm'} text-muted-foreground`
          }`}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <select
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={selectClasses}
        {...props}
      >
        {!hasValue && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Icono de flecha */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {error && errorMessage && (
        <div className="mt-2 text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}
    </div>
  )
}