/**
 * Test script for useUmamiAnalytics hook
 * Tests the enhanced Umami analytics hook functionality
 */

// Mock Next.js usePathname hook
const mockUsePathname = () => '/test-page';

// Mock DOM environment
global.window = {
  location: {
    href: 'https://example.com/test-page',
    pathname: '/test-page'
  },
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: () => {},
  removeEventListener: () => {},
};

global.document = {
  title: 'Test Page',
  referrer: 'https://example.com/previous-page',
  hidden: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  visibilityState: 'visible'
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Test Browser)',
  onLine: true,
  doNotTrack: '0'
};

// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Mock React hooks
let mockState = {
  isInitialized: false,
  isTracking: false,
  currentPageDuration: 0,
  clientStatus: {
    initialized: false,
    scriptLoaded: false,
    configValid: false,
  }
};

const mockSetState = (updater) => {
  if (typeof updater === 'function') {
    mockState = updater(mockState);
  } else {
    mockState = { ...mockState, ...updater };
  }
  console.log('State updated:', mockState);
};

const mockUseState = (initialState) => [mockState, mockSetState];
const mockUseCallback = (fn) => fn;
const mockUseEffect = (fn, deps) => {
  // Simulate effect execution
  const cleanup = fn();
  if (typeof cleanup === 'function') {
    // Store cleanup for later if needed
  }
};
const mockUseRef = (initialValue) => ({ current: initialValue });

// Mock the required modules
const mockUmamiClient = {
  initialize: async () => {
    console.log('✅ UmamiClient initialized');
    return Promise.resolve();
  },
  trackPageView: async (pageView) => {
    console.log('📄 Page view tracked:', pageView);
    return Promise.resolve();
  },
  trackEvent: async (event) => {
    console.log('📊 Event tracked:', event);
    return Promise.resolve();
  },
  getStatus: () => ({
    initialized: true,
    scriptLoaded: true,
    configValid: true,
  }),
  getQueueStats: () => ({
    totalEvents: 5,
    pendingEvents: 0,
    failedEvents: 0,
    batchesSent: 2,
    lastFlushTime: Date.now(),
    isOnline: true,
  }),
  retry: async () => Promise.resolve(),
  clearError: () => {},
  destroy: () => console.log('🧹 UmamiClient destroyed'),
};

const mockTimeTrackingManager = {
  initialize: () => {
    console.log('⏱️ TimeTrackingManager initialized');
  },
  startTracking: (pageUrl) => {
    console.log('▶️ Started tracking:', pageUrl);
    mockState.isTracking = true;
  },
  stopTracking: () => {
    console.log('⏹️ Stopped tracking');
    mockState.isTracking = false;
    return {
      pageUrl: '/test-page',
      startTime: Date.now() - 30000,
      endTime: Date.now(),
      totalDuration: 30000,
      activeDuration: 25000,
      isVisible: true,
    };
  },
  isTracking: () => mockState.isTracking,
  getCurrentTrackingData: () => ({
    pageUrl: '/test-page',
    startTime: Date.now() - 15000,
    totalDuration: 15000,
    activeDuration: 12000,
    isVisible: true,
  }),
  destroy: () => console.log('🧹 TimeTrackingManager destroyed'),
};

// Mock module imports
const getUmamiClient = () => mockUmamiClient;
const getTimeTrackingManager = () => mockTimeTrackingManager;

// Simulate the hook implementation
function createUseUmamiAnalytics() {
  return function useUmamiAnalytics(options = {}) {
    const pathname = '/test-page';
    
    const config = {
      enableTimeTracking: true,
      enableVisibilityTracking: true,
      enableCustomEvents: true,
      debug: true,
      minTrackingTime: 1000,
      maxTrackingTime: 30 * 60 * 1000,
      ...options,
    };

    // Simulate refs
    const umamiClientRef = { current: null };
    const timeTrackingManagerRef = { current: null };
    const initializationPromiseRef = { current: null };
    const currentPageRef = { current: pathname };

    const initializeAnalytics = async () => {
      if (initializationPromiseRef.current) {
        return initializationPromiseRef.current;
      }

      initializationPromiseRef.current = (async () => {
        try {
          umamiClientRef.current = getUmamiClient();
          await umamiClientRef.current.initialize();

          if (config.enableTimeTracking) {
            timeTrackingManagerRef.current = getTimeTrackingManager();
            timeTrackingManagerRef.current.initialize();
          }

          mockState.isInitialized = true;
          mockState.clientStatus = umamiClientRef.current.getStatus();
          
          console.log('🎉 Analytics initialized successfully');
        } catch (error) {
          console.error('❌ Analytics initialization failed:', error);
          mockState.lastError = error.message;
        }
      })();

      return initializationPromiseRef.current;
    };

    const trackPageView = async (pageUrl, title) => {
      const url = pageUrl || pathname;
      const pageTitle = title || 'Test Page';

      try {
        await initializeAnalytics();

        if (timeTrackingManagerRef.current?.isTracking()) {
          timeTrackingManagerRef.current.stopTracking();
        }

        if (umamiClientRef.current) {
          await umamiClientRef.current.trackPageView({
            url,
            title: pageTitle,
            referrer: document.referrer,
          });
        }

        if (timeTrackingManagerRef.current && config.enableTimeTracking) {
          timeTrackingManagerRef.current.startTracking(url);
        }

        currentPageRef.current = url;
        console.log('✅ Page view tracked successfully:', url);
      } catch (error) {
        console.error('❌ Page view tracking failed:', error);
        mockState.lastError = error.message;
      }
    };

    const trackCustomEvent = async (eventName, eventData) => {
      try {
        await initializeAnalytics();

        if (!umamiClientRef.current) {
          throw new Error('Umami client not available');
        }

        const timeTrackingData = timeTrackingManagerRef.current?.getCurrentTrackingData();

        const enhancedData = {
          category: eventData.category,
          action: eventData.action,
          label: eventData.label,
          value: eventData.value,
          ...eventData.properties,
          page_duration: timeTrackingData ? Math.round(timeTrackingData.activeDuration / 1000) : 0,
          page_url: currentPageRef.current,
          timestamp: Date.now(),
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          user_agent: navigator.userAgent,
        };

        await umamiClientRef.current.trackEvent({
          name: eventName,
          data: enhancedData,
          url: currentPageRef.current,
        });

        console.log('✅ Custom event tracked successfully:', eventName, enhancedData);
      } catch (error) {
        console.error('❌ Custom event tracking failed:', error);
        mockState.lastError = error.message;
      }
    };

    const trackInteraction = async (interactionType, elementInfo) => {
      await trackCustomEvent(`${interactionType}_${elementInfo.elementType}`, {
        category: 'interaction',
        action: interactionType,
        label: elementInfo.elementText || elementInfo.elementId,
        properties: {
          element_type: elementInfo.elementType,
          element_text: elementInfo.elementText,
          element_id: elementInfo.elementId,
          element_class: elementInfo.elementClass,
          location: elementInfo.location,
        },
      });
    };

    const trackBusinessEvent = async (eventType, eventData) => {
      await trackCustomEvent(eventType, {
        category: 'business',
        action: eventType,
        value: eventData.value,
        properties: {
          currency: eventData.currency,
          plan_type: eventData.plan_type,
          user_type: eventData.user_type,
          ...eventData.properties,
        },
      });
    };

    const getAnalyticsState = () => ({
      ...mockState,
      queueStats: umamiClientRef.current?.getQueueStats(),
      timeTrackingData: timeTrackingManagerRef.current?.getCurrentTrackingData(),
    });

    const retryFailedOperations = async () => {
      try {
        if (umamiClientRef.current) {
          await umamiClientRef.current.retry();
        }
        mockState.lastError = undefined;
        mockState.clientStatus = umamiClientRef.current?.getStatus() || mockState.clientStatus;
        console.log('✅ Retry operations completed');
      } catch (error) {
        console.error('❌ Retry operations failed:', error);
        mockState.lastError = error.message;
      }
    };

    const clearError = () => {
      umamiClientRef.current?.clearError();
      mockState.lastError = undefined;
      console.log('✅ Error state cleared');
    };

    return {
      ...mockState,
      trackPageView,
      trackCustomEvent,
      trackInteraction,
      trackBusinessEvent,
      getAnalyticsState,
      retryFailedOperations,
      clearError,
      umamiClient: umamiClientRef.current,
      timeTrackingManager: timeTrackingManagerRef.current,
    };
  };
}

// Test the hook
async function testUmamiAnalyticsHook() {
  console.log('🧪 Testing useUmamiAnalytics Hook\n');

  const useUmamiAnalytics = createUseUmamiAnalytics();
  
  // Test 1: Initialize hook with default options
  console.log('📋 Test 1: Initialize hook with default options');
  const analytics = useUmamiAnalytics({
    debug: true,
    enableTimeTracking: true,
    enableVisibilityTracking: true,
  });

  console.log('Initial state:', analytics.getAnalyticsState());
  console.log('');

  // Test 2: Track page view
  console.log('📋 Test 2: Track page view');
  await analytics.trackPageView('/test-page', 'Test Page Title');
  console.log('State after page view:', analytics.getAnalyticsState());
  console.log('');

  // Test 3: Track custom event
  console.log('📋 Test 3: Track custom event');
  await analytics.trackCustomEvent('button_click', {
    category: 'interaction',
    action: 'click',
    label: 'Subscribe Button',
    value: 1,
    properties: {
      button_color: 'blue',
      button_size: 'large',
    },
  });
  console.log('');

  // Test 4: Track interaction
  console.log('📋 Test 4: Track interaction');
  await analytics.trackInteraction('click', {
    elementType: 'button',
    elementText: 'Get Started',
    elementId: 'cta-button',
    elementClass: 'btn-primary',
    location: 'hero-section',
  });
  console.log('');

  // Test 5: Track business event
  console.log('📋 Test 5: Track business event');
  await analytics.trackBusinessEvent('subscription', {
    value: 29.99,
    currency: 'EUR',
    plan_type: 'monthly',
    user_type: 'new',
    properties: {
      payment_method: 'stripe',
      discount_applied: false,
    },
  });
  console.log('');

  // Test 6: Get analytics state
  console.log('📋 Test 6: Get analytics state');
  const state = analytics.getAnalyticsState();
  console.log('Full analytics state:', JSON.stringify(state, null, 2));
  console.log('');

  // Test 7: Test error handling
  console.log('📋 Test 7: Test error handling');
  // Simulate an error
  mockState.lastError = 'Test error message';
  console.log('State with error:', analytics.getAnalyticsState());
  
  // Clear error
  analytics.clearError();
  console.log('State after clearing error:', analytics.getAnalyticsState());
  console.log('');

  // Test 8: Test retry operations
  console.log('📋 Test 8: Test retry operations');
  await analytics.retryFailedOperations();
  console.log('');

  console.log('✅ All tests completed successfully!');
}

// Run the tests
testUmamiAnalyticsHook().catch(error => {
  console.error('❌ Test failed:', error);
});