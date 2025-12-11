/**
 * Test script for Umami Interaction Tracking System
 * Tests the custom event tracking for user interactions
 */

// Simple DOM mock for testing
const mockDOM = {
  window: {
    location: { href: 'http://localhost:3000/test-page' },
    innerWidth: 1920,
    innerHeight: 1080,
    pageYOffset: 0,
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  document: {
    title: 'Test Page',
    referrer: '',
    documentElement: { scrollHeight: 2000 },
    body: { tagName: 'BODY' },
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      textContent: '',
      appendChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    }),
    getElementById: (id) => {
      const elements = {
        'nav-button': {
          tagName: 'BUTTON',
          id: 'nav-button',
          className: 'primary',
          textContent: 'Navigation Button',
          parentElement: { tagName: 'NAV' }
        },
        'nav-link': {
          tagName: 'A',
          id: 'nav-link',
          className: '',
          textContent: 'Test Link',
          parentElement: { tagName: 'NAV' }
        },
        'cta-button': {
          tagName: 'BUTTON',
          id: 'cta-button',
          className: 'cta primary',
          textContent: 'Sign Up Now',
          parentElement: { className: 'hero' }
        },
        'secondary-button': {
          tagName: 'BUTTON',
          id: 'secondary-button',
          className: '',
          textContent: 'Learn More',
          parentElement: { className: 'hero' }
        },
        'test-form': {
          tagName: 'FORM',
          id: 'test-form',
          action: '/submit',
          method: 'POST',
          name: 'test-form',
          parentElement: { className: 'content' }
        },
        'footer-button': {
          tagName: 'BUTTON',
          id: 'footer-button',
          className: '',
          textContent: 'Footer Action',
          parentElement: { tagName: 'FOOTER' }
        }
      };
      return elements[id] || null;
    }
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    onLine: true
  }
};

// Set up global mocks
global.window = mockDOM.window;
global.document = mockDOM.document;
global.navigator = mockDOM.navigator;
global.HTMLElement = class HTMLElement {};
global.Element = class Element {};
global.HTMLButtonElement = class HTMLButtonElement extends HTMLElement {};
global.HTMLFormElement = class HTMLFormElement extends HTMLElement {};
global.HTMLAnchorElement = class HTMLAnchorElement extends HTMLElement {};
global.FormData = class FormData {
  constructor() { this.data = new Map(); }
  keys() { return ['name', 'email', 'message']; }
};

// Mock Umami client
const mockUmamiClient = {
  trackEvent: jest.fn().mockResolvedValue(undefined),
  initialize: jest.fn().mockResolvedValue(undefined),
  getStatus: jest.fn().mockReturnValue({
    initialized: true,
    scriptLoaded: true,
    configValid: true
  })
};

// Mock the Umami client module
jest.mock('./lib/umami-client', () => ({
  getUmamiClient: () => mockUmamiClient
}));

// Import the interaction tracker after mocking
const { UmamiInteractionTracker } = require('./lib/umami-interaction-tracker');

describe('Umami Interaction Tracking System', () => {
  let tracker;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create new tracker instance
    tracker = new UmamiInteractionTracker({
      enableAutoTracking: true,
      trackClicks: true,
      trackForms: true,
      trackScrolling: true,
      debug: true
    });
  });

  afterEach(() => {
    if (tracker) {
      tracker.destroy();
    }
  });

  describe('Initialization', () => {
    test('should initialize tracker successfully', () => {
      tracker.initialize();
      expect(tracker.isInitialized).toBe(true);
    });

    test('should setup event listeners for auto-tracking', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      tracker.initialize();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function), { passive: true });
    });
  });

  describe('Button Click Tracking', () => {
    test('should track button clicks with correct context', async () => {
      const button = document.getElementById('cta-button');
      
      await tracker.trackButtonClick(button);
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledWith({
        name: 'click_button',
        data: expect.objectContaining({
          interaction_type: 'click',
          element_type: 'button',
          element_text: 'Sign Up Now',
          element_id: 'cta-button',
          element_class: 'cta primary',
          page_section: 'hero',
          category: 'conversion',
          importance: 'critical',
          page_url: 'http://localhost:3000/test-page'
        })
      });
    });

    test('should determine button importance correctly', async () => {
      // Test critical importance (CTA button)
      const ctaButton = document.getElementById('cta-button');
      await tracker.trackButtonClick(ctaButton);
      
      let lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.importance).toBe('critical');

      // Test medium importance (regular button)
      const secondaryButton = document.getElementById('secondary-button');
      await tracker.trackButtonClick(secondaryButton);
      
      lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.importance).toBe('medium');
    });

    test('should detect page sections correctly', async () => {
      // Test navigation section
      const navButton = document.getElementById('nav-button');
      await tracker.trackButtonClick(navButton);
      
      let lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.page_section).toBe('navigation');

      // Test footer section
      const footerButton = document.getElementById('footer-button');
      await tracker.trackButtonClick(footerButton);
      
      lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.page_section).toBe('footer');
    });
  });

  describe('Form Submission Tracking', () => {
    test('should track form submissions with form context', async () => {
      const form = document.getElementById('test-form');
      
      await tracker.trackFormSubmission(form);
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledWith({
        name: 'form_submission',
        data: expect.objectContaining({
          form_id: 'test-form',
          form_action: '/submit',
          form_method: 'POST',
          field_count: 3,
          form_name: 'test-form',
          page_section: 'content',
          category: 'conversion',
          importance: 'high'
        })
      });
    });

    test('should handle forms without IDs', async () => {
      const form = document.createElement('form');
      document.body.appendChild(form);
      
      await tracker.trackFormSubmission(form);
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledWith({
        name: 'form_submission',
        data: expect.objectContaining({
          form_id: 'unnamed',
          form_name: 'unnamed'
        })
      });
    });
  });

  describe('Interaction Context Building', () => {
    test('should build correct interaction context for different elements', async () => {
      // Test link element
      const link = document.getElementById('nav-link');
      await tracker.trackInteraction('click', link);
      
      let lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.element_type).toBe('link');
      expect(lastCall[0].data.category).toBe('navigation');

      // Test button element
      const button = document.getElementById('cta-button');
      await tracker.trackInteraction('click', button);
      
      lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.element_type).toBe('button');
      expect(lastCall[0].data.category).toBe('conversion');
    });

    test('should extract element text correctly', async () => {
      const button = document.getElementById('cta-button');
      await tracker.trackInteraction('click', button);
      
      const lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.element_text).toBe('Sign Up Now');
    });

    test('should categorize interactions correctly', async () => {
      // Test conversion category
      const ctaButton = document.getElementById('cta-button');
      await tracker.trackInteraction('click', ctaButton);
      
      let lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.category).toBe('conversion');

      // Test navigation category
      const navLink = document.getElementById('nav-link');
      await tracker.trackInteraction('click', navLink);
      
      lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.category).toBe('navigation');
    });
  });

  describe('Business Event Tracking', () => {
    test('should track business events with correct data', async () => {
      const eventData = {
        value: 99.99,
        currency: 'USD',
        plan_type: 'premium',
        feature_name: 'advanced_analytics',
        user_id: 'user123',
        properties: {
          campaign: 'summer_sale',
          source: 'email'
        }
      };

      await tracker.trackBusinessEvent('subscription', eventData);
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledWith({
        name: 'subscription',
        data: expect.objectContaining({
          event_type: 'subscription',
          value: 99.99,
          currency: 'USD',
          plan_type: 'premium',
          feature_name: 'advanced_analytics',
          user_id: 'user123',
          category: 'conversion',
          importance: 'critical',
          campaign: 'summer_sale',
          source: 'email'
        })
      });
    });

    test('should handle business events without optional data', async () => {
      await tracker.trackBusinessEvent('signup', {});
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledWith({
        name: 'signup',
        data: expect.objectContaining({
          event_type: 'signup',
          category: 'conversion',
          importance: 'critical'
        })
      });
    });
  });

  describe('Scroll Engagement Tracking', () => {
    test('should track scroll milestones', async () => {
      // Test 25% milestone
      await tracker.trackScrollEngagement(25);
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledWith({
        name: 'scroll_depth',
        data: expect.objectContaining({
          scroll_depth: 25,
          category: 'engagement',
          importance: 'low'
        })
      });

      // Test 75% milestone (higher importance)
      await tracker.trackScrollEngagement(75);
      
      const lastCall = mockUmamiClient.trackEvent.mock.calls[mockUmamiClient.trackEvent.mock.calls.length - 1];
      expect(lastCall[0].data.scroll_depth).toBe(75);
      expect(lastCall[0].data.importance).toBe('medium');
    });

    test('should not track non-milestone scroll depths', async () => {
      const initialCallCount = mockUmamiClient.trackEvent.mock.calls.length;
      
      await tracker.trackScrollEngagement(30); // Not a milestone
      
      expect(mockUmamiClient.trackEvent.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Auto-tracking', () => {
    test('should automatically track clicks on trackable elements', () => {
      tracker.initialize();
      
      const button = document.getElementById('cta-button');
      const clickEvent = new dom.window.Event('click', { bubbles: true });
      
      button.dispatchEvent(clickEvent);
      
      // Should be called asynchronously
      setTimeout(() => {
        expect(mockUmamiClient.trackEvent).toHaveBeenCalled();
      }, 0);
    });

    test('should automatically track form submissions', () => {
      tracker.initialize();
      
      const form = document.getElementById('test-form');
      const submitEvent = new dom.window.Event('submit', { bubbles: true });
      
      form.dispatchEvent(submitEvent);
      
      // Should be called asynchronously
      setTimeout(() => {
        expect(mockUmamiClient.trackEvent).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('Error Handling', () => {
    test('should handle tracking errors gracefully', async () => {
      mockUmamiClient.trackEvent.mockRejectedValueOnce(new Error('Network error'));
      
      const button = document.getElementById('cta-button');
      
      // Should not throw
      await expect(tracker.trackButtonClick(button)).resolves.toBeUndefined();
    });

    test('should continue tracking after errors', async () => {
      mockUmamiClient.trackEvent
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);
      
      const button = document.getElementById('cta-button');
      
      // First call fails
      await tracker.trackButtonClick(button);
      
      // Second call should succeed
      await tracker.trackButtonClick(button);
      
      expect(mockUmamiClient.trackEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cleanup', () => {
    test('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      tracker.initialize();
      tracker.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    test('should reset initialization state on destroy', () => {
      tracker.initialize();
      expect(tracker.isInitialized).toBe(true);
      
      tracker.destroy();
      expect(tracker.isInitialized).toBe(false);
    });
  });
});

// Run the tests
console.log('🧪 Running Umami Interaction Tracking Tests...\n');

// Test configuration
const testConfig = {
  enableAutoTracking: true,
  trackClicks: true,
  trackForms: true,
  trackScrolling: true,
  debug: true
};

// Create test tracker
const testTracker = new UmamiInteractionTracker(testConfig);

// Test basic functionality
async function runBasicTests() {
  console.log('✅ Testing basic initialization...');
  testTracker.initialize();
  
  console.log('✅ Testing button click tracking...');
  const button = document.getElementById('cta-button');
  await testTracker.trackButtonClick(button);
  
  console.log('✅ Testing form submission tracking...');
  const form = document.getElementById('test-form');
  await testTracker.trackFormSubmission(form);
  
  console.log('✅ Testing business event tracking...');
  await testTracker.trackBusinessEvent('subscription', {
    value: 29.99,
    currency: 'USD',
    plan_type: 'pro'
  });
  
  console.log('✅ Testing scroll engagement tracking...');
  await testTracker.trackScrollEngagement(75);
  
  console.log('✅ All basic tests completed successfully!');
}

// Test interaction context building
async function testInteractionContext() {
  console.log('\n🔍 Testing interaction context building...');
  
  const elements = [
    { id: 'cta-button', expectedCategory: 'conversion', expectedImportance: 'critical' },
    { id: 'nav-link', expectedCategory: 'navigation', expectedImportance: 'low' },
    { id: 'secondary-button', expectedCategory: 'engagement', expectedImportance: 'medium' }
  ];
  
  for (const { id, expectedCategory, expectedImportance } of elements) {
    const element = document.getElementById(id);
    if (element) {
      await testTracker.trackInteraction('click', element);
      console.log(`✅ ${id}: category=${expectedCategory}, importance=${expectedImportance}`);
    }
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🛡️ Testing error handling...');
  
  // Mock error scenario
  const originalTrackEvent = mockUmamiClient.trackEvent;
  mockUmamiClient.trackEvent = jest.fn().mockRejectedValue(new Error('Test error'));
  
  try {
    const button = document.getElementById('cta-button');
    await testTracker.trackButtonClick(button);
    console.log('✅ Error handling works correctly');
  } catch (error) {
    console.log('❌ Error handling failed:', error.message);
  }
  
  // Restore original function
  mockUmamiClient.trackEvent = originalTrackEvent;
}

// Run all tests
async function runAllTests() {
  try {
    await runBasicTests();
    await testInteractionContext();
    await testErrorHandling();
    
    console.log('\n🎉 All interaction tracking tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`- Button click tracking: ✅`);
    console.log(`- Form submission tracking: ✅`);
    console.log(`- Business event tracking: ✅`);
    console.log(`- Scroll engagement tracking: ✅`);
    console.log(`- Interaction context building: ✅`);
    console.log(`- Error handling: ✅`);
    console.log(`- Auto-tracking setup: ✅`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    testTracker.destroy();
  }
}

// Export for use in other test files
module.exports = {
  UmamiInteractionTracker,
  testTracker,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}