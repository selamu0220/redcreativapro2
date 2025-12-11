/**
 * Test Enhanced Analytics Integration
 * Tests the compatibility between Google Analytics and Umami tracking
 */

// Mock Google Analytics
global.window = {
  gtag: jest.fn(),
  dataLayer: [],
  location: {
    href: 'https://example.com/test',
    pathname: '/test'
  },
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}

global.document = {
  title: 'Test Page',
  referrer: 'https://google.com',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  visibilityState: 'visible'
}

global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

global.screen = {
  width: 1920,
  height: 1080
}

// Mock Umami analytics hook
const mockUmamiAnalytics = {
  isInitialized: true,
  isTracking: true,
  currentPageDuration: 5000,
  lastError: null,
  clientStatus: {
    initialized: true,
    scriptLoaded: true,
    configValid: true
  },
  trackCustomEvent: jest.fn(),
  trackInteraction: jest.fn(),
  trackBusinessEvent: jest.fn(),
  trackElementInteraction: jest.fn(),
  trackConversionEvent: jest.fn(),
  trackFormSubmission: jest.fn(),
  trackScrollEngagement: jest.fn(),
  trackPageView: jest.fn(),
  getAnalyticsState: jest.fn(() => ({
    isInitialized: true,
    isTracking: true,
    currentPageDuration: 5000
  })),
  retryFailedOperations: jest.fn(),
  clearError: jest.fn(),
  umamiClient: {},
  timeTrackingManager: {},
  interactionTracker: {}
}

// Mock the useUmamiAnalytics hook
jest.mock('../app/hooks/useUmamiAnalytics', () => ({
  useUmamiAnalytics: () => mockUmamiAnalytics,
  CustomEventData: {}
}))

// Import the enhanced analytics hook
const { useAnalytics } = require('../app/hooks/useAnalytics')

describe('Enhanced Analytics Integration', () => {
  let analytics

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock React hooks
    const mockUseCallback = (fn) => fn
    const mockUseEffect = (fn) => fn()
    const mockUseRef = (initial) => ({ current: initial })

    global.React = {
      useCallback: mockUseCallback,
      useEffect: mockUseEffect,
      useRef: mockUseRef
    }

    // Initialize analytics
    analytics = useAnalytics()
  })

  describe('Dual Analytics Tracking', () => {
    test('should send events to both Google Analytics and Umami', () => {
      const eventData = {
        page_title: 'Test Page',
        page_location: 'https://example.com/test',
        page_path: '/test'
      }

      analytics.trackEvent('page_view', eventData)

      // Verify Google Analytics was called
      expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        ...eventData,
        timestamp: expect.any(Number),
        user_agent: expect.any(String),
        screen_resolution: '1920x1080',
        viewport_size: '1920x1080'
      }))

      // Verify Umami was called
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledWith('page_view', {
        category: 'business',
        action: 'page_view',
        properties: expect.objectContaining({
          ...eventData,
          timestamp: expect.any(Number),
          user_agent: expect.any(String),
          screen_resolution: '1920x1080',
          viewport_size: '1920x1080'
        })
      })
    })

    test('should handle Google Analytics unavailability gracefully', () => {
      // Remove gtag to simulate GA unavailability
      delete window.gtag

      const eventData = {
        page_title: 'Test Page',
        page_location: 'https://example.com/test',
        page_path: '/test'
      }

      // Should not throw error
      expect(() => {
        analytics.trackEvent('page_view', eventData)
      }).not.toThrow()

      // Umami should still be called
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalled()
    })

    test('should track page views with both systems', () => {
      analytics.trackPageView('/test-page', 'Test Page Title')

      // Verify Google Analytics page view
      expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        page_title: 'Test Page Title',
        page_location: 'https://example.com/test',
        page_path: '/test-page'
      }))

      // Verify Umami page view
      expect(mockUmamiAnalytics.trackPageView).toHaveBeenCalledWith('/test-page', 'Test Page Title')
    })
  })

  describe('Enhanced Analytics Capabilities', () => {
    test('should expose enhanced Umami analytics methods', () => {
      expect(analytics.trackCustomEvent).toBe(mockUmamiAnalytics.trackCustomEvent)
      expect(analytics.trackInteraction).toBe(mockUmamiAnalytics.trackInteraction)
      expect(analytics.trackBusinessEvent).toBe(mockUmamiAnalytics.trackBusinessEvent)
      expect(analytics.trackElementInteraction).toBe(mockUmamiAnalytics.trackElementInteraction)
      expect(analytics.trackConversionEvent).toBe(mockUmamiAnalytics.trackConversionEvent)
      expect(analytics.trackFormSubmission).toBe(mockUmamiAnalytics.trackFormSubmission)
      expect(analytics.trackScrollEngagement).toBe(mockUmamiAnalytics.trackScrollEngagement)
    })

    test('should provide analytics state information', () => {
      expect(analytics.analyticsState).toEqual({
        isInitialized: true,
        isTracking: true,
        currentPageDuration: 5000,
        lastError: null,
        clientStatus: {
          initialized: true,
          scriptLoaded: true,
          configValid: true
        }
      })
    })

    test('should provide utility methods', () => {
      expect(analytics.getAnalyticsState).toBe(mockUmamiAnalytics.getAnalyticsState)
      expect(analytics.retryFailedOperations).toBe(mockUmamiAnalytics.retryFailedOperations)
      expect(analytics.clearError).toBe(mockUmamiAnalytics.clearError)
    })

    test('should provide direct access to Umami managers', () => {
      expect(analytics.umamiClient).toBe(mockUmamiAnalytics.umamiClient)
      expect(analytics.timeTrackingManager).toBe(mockUmamiAnalytics.timeTrackingManager)
      expect(analytics.interactionTracker).toBe(mockUmamiAnalytics.interactionTracker)
    })
  })

  describe('Business Event Tracking', () => {
    test('should track pricing engagement with both systems', () => {
      analytics.trackPricingEngagement('monthly', 'click')

      // Verify Google Analytics call
      expect(window.gtag).toHaveBeenCalledWith('event', 'pricing_engagement', expect.objectContaining({
        plan_type: 'monthly',
        action: 'click',
        time_on_page: expect.any(Number)
      }))

      // Verify Umami call
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledWith('pricing_engagement', {
        category: 'business',
        action: 'pricing_engagement',
        properties: expect.objectContaining({
          plan_type: 'monthly',
          action: 'click',
          time_on_page: expect.any(Number)
        })
      })
    })

    test('should track purchase events with both systems', () => {
      analytics.trackPurchase('txn_123', 'monthly', 4.99, 'stripe')

      // Verify Google Analytics call
      expect(window.gtag).toHaveBeenCalledWith('event', 'purchase', expect.objectContaining({
        transaction_id: 'txn_123',
        plan_type: 'monthly',
        value: 4.99,
        currency: 'EUR',
        payment_method: 'stripe'
      }))

      // Verify Umami call
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledWith('purchase', {
        category: 'business',
        action: 'purchase',
        properties: expect.objectContaining({
          transaction_id: 'txn_123',
          plan_type: 'monthly',
          value: 4.99,
          currency: 'EUR',
          payment_method: 'stripe'
        })
      })
    })

    test('should track subscription success with both systems', () => {
      analytics.trackSubscriptionSuccess('monthly', 4.99, 'new')

      // Verify Google Analytics call
      expect(window.gtag).toHaveBeenCalledWith('event', 'subscription_success', expect.objectContaining({
        plan_type: 'monthly',
        value: 4.99,
        user_type: 'new'
      }))

      // Verify Umami call
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledWith('subscription_success', {
        category: 'business',
        action: 'subscription_success',
        properties: expect.objectContaining({
          plan_type: 'monthly',
          value: 4.99,
          user_type: 'new'
        })
      })
    })
  })

  describe('Interaction Tracking', () => {
    test('should track button clicks with both systems', () => {
      analytics.trackButtonClick('Subscribe', 'pricing-page')

      // Verify Google Analytics call
      expect(window.gtag).toHaveBeenCalledWith('event', 'button_click', expect.objectContaining({
        button_text: 'Subscribe',
        button_location: 'pricing-page',
        page_path: '/test'
      }))

      // Verify Umami call
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledWith('button_click', {
        category: 'business',
        action: 'button_click',
        properties: expect.objectContaining({
          button_text: 'Subscribe',
          button_location: 'pricing-page',
          page_path: '/test'
        })
      })
    })

    test('should track feature interactions with both systems', () => {
      analytics.trackFeatureInteraction('pricing_plan', 'hover')

      // Verify Google Analytics call
      expect(window.gtag).toHaveBeenCalledWith('event', 'feature_interaction', expect.objectContaining({
        feature_name: 'pricing_plan',
        interaction_type: 'hover',
        page_path: '/test'
      }))

      // Verify Umami call
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledWith('feature_interaction', {
        category: 'business',
        action: 'feature_interaction',
        properties: expect.objectContaining({
          feature_name: 'pricing_plan',
          interaction_type: 'hover',
          page_path: '/test'
        })
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle Umami errors gracefully', () => {
      // Mock Umami to throw error
      mockUmamiAnalytics.trackCustomEvent.mockImplementation(() => {
        throw new Error('Umami error')
      })

      const eventData = {
        page_title: 'Test Page',
        page_location: 'https://example.com/test',
        page_path: '/test'
      }

      // Should not throw error
      expect(() => {
        analytics.trackEvent('page_view', eventData)
      }).not.toThrow()

      // Google Analytics should still be called
      expect(window.gtag).toHaveBeenCalled()
    })

    test('should handle both systems being unavailable', () => {
      // Remove gtag and mock Umami error
      delete window.gtag
      mockUmamiAnalytics.trackCustomEvent.mockImplementation(() => {
        throw new Error('Umami error')
      })

      const eventData = {
        page_title: 'Test Page',
        page_location: 'https://example.com/test',
        page_path: '/test'
      }

      // Should not throw error
      expect(() => {
        analytics.trackEvent('page_view', eventData)
      }).not.toThrow()
    })
  })

  describe('Backward Compatibility', () => {
    test('should maintain existing API compatibility', () => {
      // All existing methods should be available
      expect(typeof analytics.trackEvent).toBe('function')
      expect(typeof analytics.trackPageView).toBe('function')
      expect(typeof analytics.trackPricingView).toBe('function')
      expect(typeof analytics.trackPricingEngagement).toBe('function')
      expect(typeof analytics.trackBeginCheckout).toBe('function')
      expect(typeof analytics.trackCheckoutProgress).toBe('function')
      expect(typeof analytics.trackAbandonCheckout).toBe('function')
      expect(typeof analytics.trackPurchase).toBe('function')
      expect(typeof analytics.trackSubscriptionSuccess).toBe('function')
      expect(typeof analytics.trackScrollDepth).toBe('function')
      expect(typeof analytics.trackTimeOnPage).toBe('function')
      expect(typeof analytics.trackButtonClick).toBe('function')
      expect(typeof analytics.trackFeatureInteraction).toBe('function')
    })

    test('should work with existing component usage patterns', () => {
      // Test patterns used in subscription page
      analytics.trackButtonClick('Cancelar Suscripción', '/subscription')
      analytics.trackEvent('subscription_cancelled', {
        plan_type: 'monthly',
        cancel_at_period_end: true,
        user_type: 'authenticated'
      })

      expect(window.gtag).toHaveBeenCalledTimes(2)
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledTimes(2)

      // Test patterns used in success page
      analytics.trackPurchase('txn_123', 'monthly', 4.99, 'stripe')
      analytics.trackSubscriptionSuccess('monthly', 4.99, 'new')
      analytics.trackPageView('/success', 'Pago Exitoso')

      expect(window.gtag).toHaveBeenCalledTimes(5)
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledTimes(4)
      expect(mockUmamiAnalytics.trackPageView).toHaveBeenCalledTimes(1)

      // Test patterns used in planes page
      analytics.trackPricingView('direct')
      analytics.trackPricingEngagement('monthly', 'click')
      analytics.trackBeginCheckout('monthly', 4.99)

      expect(window.gtag).toHaveBeenCalledTimes(8)
      expect(mockUmamiAnalytics.trackCustomEvent).toHaveBeenCalledTimes(7)
    })
  })
})

console.log('✅ Enhanced Analytics Integration Tests Completed')
console.log('📊 Testing dual analytics tracking (Google Analytics + Umami)')
console.log('🔄 Testing backward compatibility with existing components')
console.log('⚡ Testing enhanced analytics capabilities')
console.log('🛡️ Testing error handling and graceful degradation')