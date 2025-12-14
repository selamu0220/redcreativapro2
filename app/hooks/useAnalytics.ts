'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useUmamiAnalytics, CustomEventData } from './useUmamiAnalytics'

// Tipos para los eventos de analytics
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

// Eventos específicos para el negocio
export interface BusinessEvents {
  // Eventos de navegación
  page_view: {
    page_title: string
    page_location: string
    page_path: string
  }

  // Eventos de planes
  view_pricing: {
    source?: string
    referrer?: string
  }

  pricing_engagement: {
    plan_type: 'monthly' | 'lifetime' | 'discounted'
    action: 'hover' | 'click' | 'scroll_to'
    time_on_page: number
  }

  // Eventos de intención de compra
  begin_checkout: {
    plan_type: 'monthly' | 'lifetime' | 'discounted'
    plan_value: number
    currency: string
    time_to_decision: number
  }

  checkout_progress: {
    step: 'payment_method' | 'billing_info' | 'confirmation'
    plan_type: string
    plan_value: number
  }

  abandon_checkout: {
    step: string
    plan_type: string
    time_spent: number
    reason?: string
  }

  // Eventos de conversión
  purchase: {
    transaction_id: string
    plan_type: 'monthly' | 'lifetime' | 'discounted'
    value: number
    currency: string
    payment_method?: string
    time_to_conversion: number
  }

  subscription_success: {
    plan_type: string
    value: number
    user_type: 'new' | 'returning'
  }

  subscription_cancelled: {
    plan_type: string
    cancel_at_period_end: boolean
    user_type: 'authenticated' | 'anonymous'
  }

  subscription_cancel_error: {
    error_message: string
    plan_type: string
  }

  // Eventos de engagement
  scroll_depth: {
    page_path: string
    scroll_percentage: 25 | 50 | 75 | 90 | 100
    time_to_scroll: number
  }

  time_on_page: {
    page_path: string
    duration: number
    engagement_level: 'low' | 'medium' | 'high'
  }

  button_click: {
    button_text: string
    button_location: string
    page_path: string
  }

  feature_interaction: {
    feature_name: string
    interaction_type: string
    page_path: string
  }
}

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export const useAnalytics = () => {
  const startTimeRef = useRef<number>(Date.now())
  const scrollDepthRef = useRef<Set<number>>(new Set())
  const engagementTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Umami analytics integration
  const umami = useUmamiAnalytics({
    enableTimeTracking: true,
    enableVisibilityTracking: true,
    enableCustomEvents: true,
    debug: process.env.NODE_ENV === 'development',
  })

  // Función principal para enviar eventos a ambos sistemas
  const trackEvent = useCallback(<T extends keyof BusinessEvents>(
    eventName: T,
    parameters: BusinessEvents[T]
  ) => {
    // Send to Google Analytics
    const w: any = window
    if (typeof window !== 'undefined' && w.gtag) {
      try {
        w.gtag('event', eventName, {
          ...parameters,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`
        })
      } catch (error) {
        console.error('Error enviando evento a Google Analytics:', error)
      }
    }

    // Send to Umami Analytics
    try {
      const eventData: CustomEventData = {
        category: 'business',
        action: eventName,
        properties: {
          ...parameters,
          timestamp: Date.now(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : undefined,
          viewport_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined
        }
      }

      umami.trackCustomEvent(eventName, eventData)
    } catch (error) {
      console.error('Error enviando evento a Umami:', error)
    }

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event (GA4 + Umami):', eventName, parameters)
    }
  }, [umami])

  // Eventos específicos del negocio
  const trackPageView = useCallback((path: string, title?: string) => {
    startTimeRef.current = Date.now()
    scrollDepthRef.current.clear()

    // Track with Google Analytics
    trackEvent('page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: path
    })

    // Track with Umami (enhanced page tracking with time tracking)
    umami.trackPageView(path, title)
  }, [trackEvent, umami])

  const trackPricingView = useCallback((source?: string) => {
    trackEvent('view_pricing', {
      source: source || 'direct',
      referrer: document.referrer
    })
  }, [trackEvent])

  const trackPricingEngagement = useCallback((
    planType: 'monthly' | 'lifetime' | 'discounted',
    action: 'hover' | 'click' | 'scroll_to'
  ) => {
    const timeOnPage = Date.now() - startTimeRef.current

    trackEvent('pricing_engagement', {
      plan_type: planType,
      action,
      time_on_page: Math.round(timeOnPage / 1000)
    })
  }, [trackEvent])

  const trackBeginCheckout = useCallback((
    planType: 'monthly' | 'lifetime' | 'discounted',
    planValue: number
  ) => {
    const timeToDecision = Date.now() - startTimeRef.current

    trackEvent('begin_checkout', {
      plan_type: planType,
      plan_value: planValue,
      currency: 'EUR',
      time_to_decision: Math.round(timeToDecision / 1000)
    })
  }, [trackEvent])

  const trackCheckoutProgress = useCallback((
    step: 'payment_method' | 'billing_info' | 'confirmation',
    planType: string,
    planValue: number
  ) => {
    trackEvent('checkout_progress', {
      step,
      plan_type: planType,
      plan_value: planValue
    })
  }, [trackEvent])

  const trackAbandonCheckout = useCallback((
    step: string,
    planType: string,
    reason?: string
  ) => {
    const timeSpent = Date.now() - startTimeRef.current

    trackEvent('abandon_checkout', {
      step,
      plan_type: planType,
      time_spent: Math.round(timeSpent / 1000),
      reason
    })
  }, [trackEvent])

  const trackPurchase = useCallback((
    transactionId: string,
    planType: 'monthly' | 'lifetime' | 'discounted',
    value: number,
    paymentMethod?: string
  ) => {
    const timeToConversion = Date.now() - startTimeRef.current

    trackEvent('purchase', {
      transaction_id: transactionId,
      plan_type: planType,
      value,
      currency: 'EUR',
      payment_method: paymentMethod,
      time_to_conversion: Math.round(timeToConversion / 1000)
    })
  }, [trackEvent])

  const trackSubscriptionSuccess = useCallback((
    planType: string,
    value: number,
    userType: 'new' | 'returning' = 'new'
  ) => {
    trackEvent('subscription_success', {
      plan_type: planType,
      value,
      user_type: userType
    })
  }, [trackEvent])

  const trackScrollDepth = useCallback((percentage: 25 | 50 | 75 | 90 | 100) => {
    if (scrollDepthRef.current.has(percentage)) return

    scrollDepthRef.current.add(percentage)
    const timeToScroll = Date.now() - startTimeRef.current

    trackEvent('scroll_depth', {
      page_path: window.location.pathname,
      scroll_percentage: percentage,
      time_to_scroll: Math.round(timeToScroll / 1000)
    })
  }, [trackEvent])

  const trackTimeOnPage = useCallback(() => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    let engagementLevel: 'low' | 'medium' | 'high' = 'low'

    if (duration > 300) engagementLevel = 'high'      // > 5 minutos
    else if (duration > 60) engagementLevel = 'medium' // > 1 minuto

    trackEvent('time_on_page', {
      page_path: window.location.pathname,
      duration,
      engagement_level: engagementLevel
    })
  }, [trackEvent])

  const trackButtonClick = useCallback((
    buttonText: string,
    buttonLocation: string
  ) => {
    trackEvent('button_click', {
      button_text: buttonText,
      button_location: buttonLocation,
      page_path: window.location.pathname
    })
  }, [trackEvent])

  const trackFeatureInteraction = useCallback((
    featureName: string,
    interactionType: string
  ) => {
    trackEvent('feature_interaction', {
      feature_name: featureName,
      interaction_type: interactionType,
      page_path: window.location.pathname
    })
  }, [trackEvent])

  // Hook para tracking automático de scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100)

      if (scrollPercent >= 25 && !scrollDepthRef.current.has(25)) trackScrollDepth(25)
      if (scrollPercent >= 50 && !scrollDepthRef.current.has(50)) trackScrollDepth(50)
      if (scrollPercent >= 75 && !scrollDepthRef.current.has(75)) trackScrollDepth(75)
      if (scrollPercent >= 90 && !scrollDepthRef.current.has(90)) trackScrollDepth(90)
      if (scrollPercent >= 100 && !scrollDepthRef.current.has(100)) trackScrollDepth(100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackScrollDepth])

  // Hook para tracking de tiempo en página al salir
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackTimeOnPage()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackTimeOnPage()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [trackTimeOnPage])

  // Memoize the return object to prevent unnecessary re-renders in consumers
  return useMemo(() => ({
    // Funciones principales
    trackEvent,
    trackPageView,

    // Eventos de planes y pricing
    trackPricingView,
    trackPricingEngagement,

    // Eventos de checkout
    trackBeginCheckout,
    trackCheckoutProgress,
    trackAbandonCheckout,

    // Eventos de conversión
    trackPurchase,
    trackSubscriptionSuccess,

    // Eventos de engagement
    trackScrollDepth,
    trackTimeOnPage,
    trackButtonClick,
    trackFeatureInteraction,

    // Enhanced Umami analytics capabilities
    trackCustomEvent: umami.trackCustomEvent,
    trackInteraction: umami.trackInteraction,
    trackBusinessEvent: umami.trackBusinessEvent,
    trackElementInteraction: umami.trackElementInteraction,
    trackConversionEvent: umami.trackConversionEvent,
    trackFormSubmission: umami.trackFormSubmission,
    trackScrollEngagement: umami.trackScrollEngagement,

    // Analytics state and utilities
    analyticsState: {
      isInitialized: umami.isInitialized,
      isTracking: umami.isTracking,
      currentPageDuration: umami.currentPageDuration,
      lastError: umami.lastError,
      clientStatus: umami.clientStatus,
    },
    getAnalyticsState: umami.getAnalyticsState,
    retryFailedOperations: umami.retryFailedOperations,
    clearError: umami.clearError,

    // Direct access to Umami managers for advanced usage
    umamiClient: umami.umamiClient,
    timeTrackingManager: umami.timeTrackingManager,
    interactionTracker: umami.interactionTracker,
  }), [
    trackEvent,
    trackPageView,
    trackPricingView,
    trackPricingEngagement,
    trackBeginCheckout,
    trackCheckoutProgress,
    trackAbandonCheckout,
    trackPurchase,
    trackSubscriptionSuccess,
    trackScrollDepth,
    trackTimeOnPage,
    trackButtonClick,
    trackFeatureInteraction,
    umami
  ])
}
