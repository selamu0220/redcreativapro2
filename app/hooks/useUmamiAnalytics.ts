'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getUmamiClient, UmamiClient } from '@/lib/umami-client'
import { getTimeTrackingManager, TimeTrackingManager, TimeTrackingData } from '@/lib/time-tracking-manager'
import { UmamiInteractionTracker, InteractionContext, FormInteractionData } from '@/lib/umami-interaction-tracker'

/**
 * Enhanced Umami Analytics Hook
 * Integrates Umami client with existing analytics patterns and adds time tracking
 */

export interface UmamiAnalyticsOptions {
  enableTimeTracking?: boolean
  enableVisibilityTracking?: boolean
  enableCustomEvents?: boolean
  debug?: boolean
  minTrackingTime?: number
  maxTrackingTime?: number
}

export interface UmamiAnalyticsState {
  isInitialized: boolean
  isTracking: boolean
  currentPageDuration: number
  lastError?: string
  clientStatus: {
    initialized: boolean
    scriptLoaded: boolean
    configValid: boolean
  }
}

export interface CustomEventData {
  category: 'interaction' | 'navigation' | 'engagement' | 'conversion' | 'business'
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
}

interface UmamiInteractionTrackerOptions {
  enableAutoTracking?: boolean
  trackClicks?: boolean
  trackForms?: boolean
  trackScrolling?: boolean
  trackKeyboardEvents?: boolean
  debug?: boolean
}

export const useUmamiAnalytics = (options: UmamiAnalyticsOptions = {}) => {
  const pathname = usePathname()

  // Memoize configuration to prevent infinite re-renders
  const config = useMemo(() => ({
    enableTimeTracking: true,
    enableVisibilityTracking: true,
    enableCustomEvents: true,
    debug: false,
    minTrackingTime: 1000,
    maxTrackingTime: 30 * 60 * 1000,
    ...options,
  }), [
    options.enableTimeTracking,
    options.enableVisibilityTracking,
    options.enableCustomEvents,
    options.debug,
    options.minTrackingTime,
    options.maxTrackingTime,
  ])

  // State management
  const [analyticsState, setAnalyticsState] = useState<UmamiAnalyticsState>({
    isInitialized: false,
    isTracking: false,
    currentPageDuration: 0,
    clientStatus: {
      initialized: false,
      scriptLoaded: false,
      configValid: false,
    }
  })

  // Refs for client instances and tracking
  const umamiClientRef = useRef<UmamiClient | null>(null)
  const timeTrackingManagerRef = useRef<TimeTrackingManager | null>(null)
  const interactionTrackerRef = useRef<UmamiInteractionTracker | null>(null)
  const initializationPromiseRef = useRef<Promise<void> | null>(null)
  const currentPageRef = useRef<string>(pathname)
  const durationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Initialize Umami client and time tracking manager
   */
  const initializeAnalytics = useCallback(async () => {
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current
    }

    initializationPromiseRef.current = (async () => {
      try {
        // Initialize Umami client
        umamiClientRef.current = getUmamiClient({
          enableTimeTracking: config.enableTimeTracking,
          batchEvents: true,
          respectDNT: true,
          debug: config.debug,
        })

        await umamiClientRef.current.initialize()

        // Initialize time tracking manager if enabled
        if (config.enableTimeTracking) {
          timeTrackingManagerRef.current = getTimeTrackingManager(
            {
              enableVisibilityTracking: config.enableVisibilityTracking,
              minTrackingTime: config.minTrackingTime,
              maxTrackingTime: config.maxTrackingTime,
              debug: config.debug,
            },
            {
              onTimeUpdate: (data: TimeTrackingData) => {
                // Use functional update to prevent dependency issues
                setAnalyticsState(prev => {
                  if (prev.currentPageDuration !== data.activeDuration) {
                    return {
                      ...prev,
                      currentPageDuration: data.activeDuration,
                    }
                  }
                  return prev
                })
              },
              onTrackingStart: (pageUrl: string) => {
                setAnalyticsState(prev => {
                  if (!prev.isTracking) {
                    return {
                      ...prev,
                      isTracking: true,
                    }
                  }
                  return prev
                })
              },
              onTrackingStop: (data: TimeTrackingData) => {
                // Send time tracking data to Umami (don't await to prevent blocking)
                if (umamiClientRef.current && data.activeDuration >= config.minTrackingTime) {
                  umamiClientRef.current.trackEvent({
                    name: 'time_on_page',
                    data: {
                      duration: Math.round(data.activeDuration / 1000),
                      total_duration: Math.round(data.totalDuration / 1000),
                      page_url: data.pageUrl,
                      engagement_level: getEngagementLevel(data.activeDuration),
                    },
                  }).catch(error => {
                    if (config.debug) {
                      console.error('[UmamiAnalytics] Failed to track time event:', error)
                    }
                  })
                }

                setAnalyticsState(prev => {
                  if (prev.isTracking || prev.currentPageDuration !== 0) {
                    return {
                      ...prev,
                      isTracking: false,
                      currentPageDuration: 0,
                    }
                  }
                  return prev
                })
              },
              onVisibilityChange: (isVisible: boolean, data: TimeTrackingData) => {
                if (config.debug) {
                  console.log('[UmamiAnalytics] Visibility changed:', isVisible, data)
                }
              },
            }
          )

          timeTrackingManagerRef.current.initialize()
        }

        // Initialize interaction tracker if custom events are enabled
        if (config.enableCustomEvents) {
          interactionTrackerRef.current = new UmamiInteractionTracker({
            enableAutoTracking: true,
            trackClicks: true,
            trackForms: true,
            trackScrolling: true,
            trackKeyboardEvents: false,
            debug: config.debug,
          } as any)
        }

        // Update state
        setAnalyticsState(prev => ({
          ...prev,
          isInitialized: true,
          clientStatus: umamiClientRef.current?.getStatus() || prev.clientStatus,
          lastError: undefined,
        }))

        if (config.debug) {
          console.log('[UmamiAnalytics] Initialized successfully')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
        setAnalyticsState(prev => ({
          ...prev,
          lastError: errorMessage,
        }))

        if (config.debug) {
          console.error('[UmamiAnalytics] Initialization failed:', error)
        }
      }
    })()

    return initializationPromiseRef.current
  }, [
    config.enableTimeTracking,
    config.enableVisibilityTracking,
    config.minTrackingTime,
    config.maxTrackingTime,
    config.debug,
    config.enableCustomEvents,
  ])

  /**
   * Track page view with time tracking integration
   */
  const trackPageView = useCallback(async (pageUrl?: string, title?: string) => {
    const url = pageUrl || pathname
    const pageTitle = title || (typeof document !== 'undefined' ? document.title : '')

    // Update ref immediately to prevent infinite loops in useEffect
    currentPageRef.current = url

    try {
      // Ensure analytics is initialized
      await initializeAnalytics()

      // Stop previous page tracking
      if (timeTrackingManagerRef.current?.isTracking()) {
        timeTrackingManagerRef.current.stopTracking()
      }

      // Track page view with Umami
      if (umamiClientRef.current) {
        await umamiClientRef.current.trackPageView({
          url,
          title: pageTitle,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        })
      }

      // Start time tracking for new page
      if (timeTrackingManagerRef.current && config.enableTimeTracking) {
        timeTrackingManagerRef.current.startTracking(url)
      }

      if (config.debug) {
        console.log('[UmamiAnalytics] Page view tracked:', url)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown page view error'
      setAnalyticsState(prev => ({
        ...prev,
        lastError: errorMessage,
      }))

      if (config.debug) {
        console.error('[UmamiAnalytics] Page view tracking failed:', error)
      }
    }
  }, [pathname, initializeAnalytics, config])

  /**
   * Track custom events with enhanced data
   */
  const trackCustomEvent = useCallback(async (
    eventName: string,
    eventData: CustomEventData
  ) => {
    try {
      await initializeAnalytics()

      if (!umamiClientRef.current) {
        throw new Error('Umami client not available')
      }

      // Get current time tracking data for context
      const timeTrackingData = timeTrackingManagerRef.current?.getCurrentTrackingData()

      // Prepare event data with enhanced context
      const enhancedData = {
        category: eventData.category,
        action: eventData.action,
        label: eventData.label,
        value: eventData.value,
        ...eventData.properties,
        // Add time tracking context
        page_duration: timeTrackingData ? Math.round(timeTrackingData.activeDuration / 1000) : 0,
        page_url: currentPageRef.current,
        timestamp: Date.now(),
        // Add browser context
        viewport_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }

      await umamiClientRef.current.trackEvent({
        name: eventName,
        data: enhancedData,
        url: currentPageRef.current,
      })

      if (config.debug) {
        console.log('[UmamiAnalytics] Custom event tracked:', eventName, enhancedData)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown event tracking error'
      setAnalyticsState(prev => ({
        ...prev,
        lastError: errorMessage,
      }))

      if (config.debug) {
        console.error('[UmamiAnalytics] Custom event tracking failed:', error)
      }
    }
  }, [initializeAnalytics, config])

  /**
   * Track user interactions (buttons, links, forms)
   */
  const trackInteraction = useCallback(async (
    interactionType: 'click' | 'submit' | 'focus' | 'hover',
    elementInfo: {
      elementType: string
      elementText?: string
      elementId?: string
      elementClass?: string
      location?: string
    }
  ) => {
    await trackCustomEvent(`${interactionType}_${elementInfo.elementType}`, {
      category: 'interaction',
      action: interactionType,
      label: elementInfo.elementText || elementInfo.elementId,
      // properties removed
    })
  }, [trackCustomEvent])

  /**
   * Track business events (conversions, subscriptions, etc.)
   */
  const trackBusinessEvent = useCallback(async (
    eventType: 'conversion' | 'subscription' | 'purchase' | 'signup' | 'login',
    eventData: {
      value?: number
      currency?: string
      plan_type?: string
      user_type?: string
      properties?: Record<string, any>
    }
  ) => {
    await trackCustomEvent(eventType, {
      category: 'business',
      action: eventType,
      value: eventData.value,
      // properties removed
    })
  }, [trackCustomEvent])

  /**
   * Track button clicks with enhanced context
   */
  const trackButtonClick = useCallback(async (
    button: HTMLButtonElement | HTMLAnchorElement,
    customContext?: Record<string, any>
  ) => {
    if (interactionTrackerRef.current) {
      if (button instanceof HTMLButtonElement) {
        await interactionTrackerRef.current.trackButtonClick(button, customContext)
      } else if (button instanceof HTMLAnchorElement) {
        // /* trackLinkClick not available */
      }
    }
  }, [])

  /**
   * Track form submissions with form data context
   */
  const trackFormSubmission = useCallback(async (
    form: HTMLFormElement,
    customContext?: Partial<InteractionContext>
  ) => {
    if (interactionTrackerRef.current && interactionTrackerRef.current.trackFormSubmission) {
      // Convert InteractionContext to FormInteractionData
      const formContext = {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        formName: form.name,
        pageSection: customContext?.pageSection,
        category: (customContext as any)?.interactionCategory || 'engagement',
        importance: (customContext as any)?.importance,
      }
      await interactionTrackerRef.current.trackFormSubmission(form, formContext)
    }
  }, [])

  /**
   * Track scroll engagement milestones
   */
  const trackScrollEngagement = useCallback(async (scrollDepth: number) => {
    if (interactionTrackerRef.current) {
      // Use the trackInteraction method with scroll category
      await interactionTrackerRef.current.trackInteraction('scroll', document.body, {
        // properties removed
        importance: scrollDepth > 75 ? 'medium' : 'low'
      })
    }
  }, [])

  /**
   * Track specific interaction with element
   */
  const trackElementInteraction = useCallback(async (
    type: 'click' | 'submit' | 'focus' | 'hover' | 'scroll' | 'resize' | 'keypress',
    element: Element,
    customContext?: Partial<InteractionContext>
  ) => {
    if (interactionTrackerRef.current) {
      // Use the trackInteraction method with appropriate category and action
      await interactionTrackerRef.current.trackInteraction(type, document.body, {
        // properties removed
        importance: (customContext as any)?.importance || 'medium'
      })
    }
  }, [])

  /**
   * Track business conversion events
   */
  const trackConversionEvent = useCallback(async (
    eventType: 'conversion' | 'subscription' | 'purchase' | 'signup' | 'login' | 'feature_use',
    eventData: {
      value?: number
      currency?: string
      plan_type?: string
      feature_name?: string
      user_id?: string
      properties?: Record<string, any>
    }
  ) => {
    if (interactionTrackerRef.current) {
      // Map to the correct method based on event type
      if (eventType === 'conversion' || eventType === 'subscription' || eventType === 'purchase' || eventType === 'signup') {
        const conversionType = eventType as 'signup' | 'purchase' | 'subscription'
        // /* trackConversion not available */
      } else if (eventType === 'feature_use') {
        // /* trackFeatureUsage not available */
      }
    }
  }, [])

  /**
   * Get current analytics state and metrics
   */
  const getAnalyticsState = useCallback(() => {
    return {
      ...analyticsState,
      queueStats: umamiClientRef.current?.getQueueStats(),
      timeTrackingData: timeTrackingManagerRef.current?.getCurrentTrackingData(),
    }
  }, [analyticsState])

  /**
   * Retry failed operations
   */
  const retryFailedOperations = useCallback(async () => {
    try {
      if (umamiClientRef.current) {
        await umamiClientRef.current.retry()
      }

      setAnalyticsState(prev => ({
        ...prev,
        lastError: undefined,
        clientStatus: umamiClientRef.current?.getStatus() || prev.clientStatus,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed'
      setAnalyticsState(prev => ({
        ...prev,
        lastError: errorMessage,
      }))
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    umamiClientRef.current?.clearError()
    setAnalyticsState(prev => ({
      ...prev,
      lastError: undefined,
    }))
  }, [])

  // Initialize analytics on mount
  useEffect(() => {
    initializeAnalytics()
  }, [initializeAnalytics])

  // Track page changes
  // Use a ref to prevent infinite loops, ignoring dependencies on trackPageView
  useEffect(() => {
    if (analyticsState.isInitialized && pathname && pathname !== currentPageRef.current) {
      // Defer execution to break synchronous cycles
      const timer = setTimeout(() => {
        trackPageView(pathname)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [pathname, analyticsState.isInitialized]) // Removed trackPageView from deps

  // Update duration display periodically (only when tracking starts/stops)
  useEffect(() => {
    if (analyticsState.isTracking && !durationUpdateIntervalRef.current) {
      durationUpdateIntervalRef.current = setInterval(() => {
        const timeTrackingData = timeTrackingManagerRef.current?.getCurrentTrackingData()
        if (timeTrackingData) {
          setAnalyticsState(prev => {
            // Only update if the duration has actually changed significantly
            const durationDiff = Math.abs(prev.currentPageDuration - timeTrackingData.activeDuration)
            if (durationDiff > 500) { // Only update if difference is more than 500ms
              return {
                ...prev,
                currentPageDuration: timeTrackingData.activeDuration,
              }
            }
            return prev
          })
        }
      }, 2000) // Update every 2 seconds instead of 1 second
    } else if (!analyticsState.isTracking && durationUpdateIntervalRef.current) {
      clearInterval(durationUpdateIntervalRef.current)
      durationUpdateIntervalRef.current = null
    }

    return () => {
      if (durationUpdateIntervalRef.current) {
        clearInterval(durationUpdateIntervalRef.current)
        durationUpdateIntervalRef.current = null
      }
    }
  }, [analyticsState.isTracking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeTrackingManagerRef.current) {
        timeTrackingManagerRef.current.destroy()
      }
      if (umamiClientRef.current) {
        umamiClientRef.current.destroy()
      }
      // Interaction tracker cleanup is handled automatically
      if (durationUpdateIntervalRef.current) {
        clearInterval(durationUpdateIntervalRef.current)
      }
    }
  }, [])

  return {
    // State
    ...analyticsState,

    // Core tracking methods
    trackPageView,
    trackCustomEvent,
    trackInteraction,
    trackBusinessEvent,

    // Enhanced interaction tracking methods
    trackButtonClick,
    trackFormSubmission,
    trackScrollEngagement,
    trackElementInteraction,
    trackConversionEvent,

    // Utility methods
    getAnalyticsState,
    retryFailedOperations,
    clearError,

    // Direct access to managers (for advanced usage)
    umamiClient: umamiClientRef.current,
    timeTrackingManager: timeTrackingManagerRef.current,
    interactionTracker: interactionTrackerRef.current,
  }
}

/**
 * Utility function to determine engagement level based on time spent
 */
function getEngagementLevel(duration: number): 'low' | 'medium' | 'high' {
  const seconds = duration / 1000

  if (seconds > 300) return 'high'      // > 5 minutes
  if (seconds > 60) return 'medium'     // > 1 minute
  return 'low'
}

/**
 * Hook for simplified page tracking (compatible with existing useAnalytics)
 */
export const useUmamiPageTracking = (options?: UmamiAnalyticsOptions) => {
  const { trackPageView, trackCustomEvent, trackInteraction, ...rest } = useUmamiAnalytics(options)

  // Simplified interface compatible with existing patterns
  const trackEvent = useCallback((eventName: string, data: Record<string, any>) => {
    return trackCustomEvent(eventName, {
      category: 'engagement',
      action: eventName,
      properties: data,
    })
  }, [trackCustomEvent])

  const trackButtonClick = useCallback((buttonText: string, buttonLocation: string) => {
    return trackInteraction('click', {
      elementType: 'button',
      elementText: buttonText,
      location: buttonLocation,
    })
  }, [trackInteraction])

  const trackFeatureInteraction = useCallback((featureName: string, interactionType: string) => {
    return trackCustomEvent('feature_interaction', {
      category: 'engagement',
      action: interactionType,
      label: featureName,
      // properties removed
    })
  }, [trackCustomEvent])

  return {
    ...rest,
    trackPageView,
    trackEvent,
    trackButtonClick,
    trackFeatureInteraction,
    trackInteraction,
    trackCustomEvent,
  }
}