/**
 * Test suite for Umami Event Batching and Queue System
 * Tests event batching, retry logic, and offline support
 */

const { UmamiEventQueue } = require('./lib/umami-event-queue');

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key],
    clear: () => store = {},
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] || null
  };
})();

// Mock navigator for online/offline testing
const mockNavigator = {
  onLine: true,
  sendBeacon: jest.fn(() => true)
};

// Setup global mocks
global.localStorage = mockLocalStorage;
global.navigator = mockNavigator;
global.window = {
  addEventListener: jest.fn(),
  location: { href: 'https://test.com/page' }
};

describe('UmamiEventQueue', () => {
  let eventQueue;
  let mockSendFunction;
  let sentEvents = [];

  beforeEach(() => {
    // Reset mocks
    sentEvents = [];
    mockLocalStorage.clear();
    mockNavigator.onLine = true;
    
    // Create mock send function
    mockSendFunction = jest.fn(async (events) => {
      sentEvents.push(...events);
      return Promise.resolve();
    });

    // Create event queue with test configuration
    eventQueue = new UmamiEventQueue(mockSendFunction, {
      maxBatchSize: 3,
      flushInterval: 100, // 100ms for faster testing
      maxRetries: 2,
      baseRetryDelay: 50,
      maxRetryDelay: 1000,
      enableOfflineStorage: true,
      storageKey: 'test_umami_queue'
    });
  });

  afterEach(() => {
    if (eventQueue) {
      eventQueue.destroy();
    }
  });

  describe('Event Batching', () => {
    test('should batch events and flush when batch size is reached', async () => {
      // Add events to reach batch size
      eventQueue.enqueue('event1', { data: 'test1' });
      eventQueue.enqueue('event2', { data: 'test2' });
      eventQueue.enqueue('event3', { data: 'test3' }); // Should trigger flush

      // Wait for async flush
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockSendFunction).toHaveBeenCalledTimes(1);
      expect(sentEvents).toHaveLength(3);
      expect(sentEvents[0].name).toBe('event1');
      expect(sentEvents[1].name).toBe('event2');
      expect(sentEvents[2].name).toBe('event3');
    });

    test('should flush events after flush interval', async () => {
      eventQueue.enqueue('event1', { data: 'test1' });
      eventQueue.enqueue('event2', { data: 'test2' });

      // Wait for flush interval
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockSendFunction).toHaveBeenCalledTimes(1);
      expect(sentEvents).toHaveLength(2);
    });

    test('should prioritize high priority events', async () => {
      eventQueue.enqueue('low', {}, { priority: 'low' });
      eventQueue.enqueue('high', {}, { priority: 'high' }); // Should flush immediately

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockSendFunction).toHaveBeenCalledTimes(1);
      expect(sentEvents).toHaveLength(2);
      expect(sentEvents[0].name).toBe('high'); // High priority should be first
      expect(sentEvents[1].name).toBe('low');
    });

    test('should flush critical events immediately', async () => {
      eventQueue.enqueue('critical', {}, { priority: 'critical' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockSendFunction).toHaveBeenCalledTimes(1);
      expect(sentEvents).toHaveLength(1);
      expect(sentEvents[0].name).toBe('critical');
    });
  });

  describe('Retry Logic', () => {
    test('should retry failed events with exponential backoff', async () => {
      let callCount = 0;
      const failingMockSend = jest.fn(async (events) => {
        callCount++;
        if (callCount <= 2) {
          throw new Error('Network error');
        }
        sentEvents.push(...events);
      });

      eventQueue = new UmamiEventQueue(failingMockSend, {
        maxBatchSize: 1,
        flushInterval: 100,
        maxRetries: 3,
        baseRetryDelay: 50,
        maxRetryDelay: 1000
      });

      eventQueue.enqueue('retry-test', { data: 'test' });

      // Wait for initial attempt and retries
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(failingMockSend).toHaveBeenCalledTimes(3);
      expect(sentEvents).toHaveLength(1);
      expect(sentEvents[0].name).toBe('retry-test');
    });

    test('should stop retrying after max retries exceeded', async () => {
      const alwaysFailingMockSend = jest.fn(async () => {
        throw new Error('Permanent failure');
      });

      eventQueue = new UmamiEventQueue(alwaysFailingMockSend, {
        maxBatchSize: 1,
        flushInterval: 100,
        maxRetries: 2,
        baseRetryDelay: 50
      });

      eventQueue.enqueue('fail-test', { data: 'test' });

      // Wait for all retry attempts
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(alwaysFailingMockSend).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(sentEvents).toHaveLength(0);
    });
  });

  describe('Offline Support', () => {
    test('should store critical events in localStorage when offline', () => {
      eventQueue.setOnlineStatus(false);
      eventQueue.enqueue('critical-offline', { data: 'test' }, { priority: 'critical' });

      const stored = JSON.parse(mockLocalStorage.getItem('test_umami_queue') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('critical-offline');
    });

    test('should process offline events when coming back online', async () => {
      // Store events offline
      const offlineEvents = [
        {
          id: 'offline-1',
          name: 'offline-event',
          data: { test: 'data' },
          url: 'https://test.com',
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal'
        }
      ];
      mockLocalStorage.setItem('test_umami_queue', JSON.stringify(offlineEvents));

      // Create new queue (simulates page reload)
      eventQueue.destroy();
      eventQueue = new UmamiEventQueue(mockSendFunction, {
        enableOfflineStorage: true,
        storageKey: 'test_umami_queue'
      });

      // Simulate coming back online
      eventQueue.setOnlineStatus(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendFunction).toHaveBeenCalled();
      expect(sentEvents).toHaveLength(1);
      expect(sentEvents[0].name).toBe('offline-event');
      
      // Should clear offline storage after successful send
      const remainingStored = mockLocalStorage.getItem('test_umami_queue');
      expect(remainingStored).toBeNull();
    });

    test('should not send events when offline', async () => {
      eventQueue.setOnlineStatus(false);
      eventQueue.enqueue('offline-test', { data: 'test' });

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockSendFunction).not.toHaveBeenCalled();
      expect(sentEvents).toHaveLength(0);
    });
  });

  describe('Queue Statistics', () => {
    test('should track queue statistics correctly', async () => {
      eventQueue.enqueue('stat-test-1', {});
      eventQueue.enqueue('stat-test-2', {});

      let stats = eventQueue.getStats();
      expect(stats.totalEvents).toBe(2);
      expect(stats.pendingEvents).toBe(2);

      await eventQueue.flush();

      stats = eventQueue.getStats();
      expect(stats.pendingEvents).toBe(0);
      expect(stats.batchesSent).toBe(1);
    });

    test('should track failed events in statistics', async () => {
      const failingMockSend = jest.fn(async () => {
        throw new Error('Test failure');
      });

      eventQueue = new UmamiEventQueue(failingMockSend, {
        maxRetries: 1,
        baseRetryDelay: 50
      });

      eventQueue.enqueue('fail-stat-test', {});

      await new Promise(resolve => setTimeout(resolve, 200));

      const stats = eventQueue.getStats();
      expect(stats.failedEvents).toBeGreaterThan(0);
    });
  });

  describe('Queue Management', () => {
    test('should clear all events when clear() is called', () => {
      eventQueue.enqueue('clear-test-1', {});
      eventQueue.enqueue('clear-test-2', {});

      let stats = eventQueue.getStats();
      expect(stats.pendingEvents).toBe(2);

      eventQueue.clear();

      stats = eventQueue.getStats();
      expect(stats.pendingEvents).toBe(0);
      expect(mockLocalStorage.getItem('test_umami_queue')).toBeNull();
    });

    test('should handle queue destruction gracefully', async () => {
      eventQueue.enqueue('destroy-test', {});
      
      // Destroy should attempt to flush remaining events
      eventQueue.destroy();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have attempted to send the event
      expect(mockSendFunction).toHaveBeenCalled();
    });
  });

  describe('Event ID Generation', () => {
    test('should generate unique event IDs', () => {
      eventQueue.enqueue('id-test-1', {});
      eventQueue.enqueue('id-test-2', {});

      // Force flush to capture events
      eventQueue.flush();

      setTimeout(() => {
        expect(sentEvents).toHaveLength(2);
        expect(sentEvents[0].id).not.toBe(sentEvents[1].id);
        expect(sentEvents[0].id).toMatch(/^\d+-[a-z0-9]+$/);
        expect(sentEvents[1].id).toMatch(/^\d+-[a-z0-9]+$/);
      }, 50);
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw error
      expect(() => {
        eventQueue.enqueue('storage-error-test', {}, { priority: 'critical' });
      }).not.toThrow();

      // Restore original function
      mockLocalStorage.setItem = originalSetItem;
    });

    test('should handle malformed offline data gracefully', () => {
      // Store malformed data
      mockLocalStorage.setItem('test_umami_queue', 'invalid-json');

      // Should not throw when creating new queue
      expect(() => {
        eventQueue.destroy();
        eventQueue = new UmamiEventQueue(mockSendFunction, {
          enableOfflineStorage: true,
          storageKey: 'test_umami_queue'
        });
      }).not.toThrow();
    });
  });
});

console.log('Running Umami Event Queue tests...');

// Run a simple integration test
async function runIntegrationTest() {
  console.log('\n=== Integration Test ===');
  
  let testEvents = [];
  const testSendFunction = async (events) => {
    testEvents.push(...events);
    console.log(`Sent batch of ${events.length} events`);
  };

  const queue = new UmamiEventQueue(testSendFunction, {
    maxBatchSize: 2,
    flushInterval: 200,
    enableOfflineStorage: true
  });

  // Test normal batching
  console.log('Testing normal event batching...');
  queue.enqueue('page_view', { url: '/home' });
  queue.enqueue('button_click', { button: 'signup' });
  queue.enqueue('form_submit', { form: 'contact' }); // Should trigger flush

  await new Promise(resolve => setTimeout(resolve, 100));

  // Test priority handling
  console.log('Testing priority handling...');
  queue.enqueue('low_priority', {}, { priority: 'low' });
  queue.enqueue('critical_event', {}, { priority: 'critical' }); // Should flush immediately

  await new Promise(resolve => setTimeout(resolve, 100));

  // Test offline storage
  console.log('Testing offline storage...');
  queue.setOnlineStatus(false);
  queue.enqueue('offline_event', {}, { priority: 'critical' });
  
  // Check if stored offline
  const stored = mockLocalStorage.getItem('umami_event_queue');
  console.log('Offline storage:', stored ? 'Events stored' : 'No events stored');

  // Come back online
  queue.setOnlineStatus(true);
  await new Promise(resolve => setTimeout(resolve, 300));

  // Get final stats
  const stats = queue.getStats();
  console.log('Final stats:', {
    totalEvents: stats.totalEvents,
    batchesSent: stats.batchesSent,
    isOnline: stats.isOnline
  });

  console.log(`Total events processed: ${testEvents.length}`);
  
  queue.destroy();
  console.log('Integration test completed successfully!');
}

// Run the integration test
runIntegrationTest().catch(console.error);