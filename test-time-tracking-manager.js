/**
 * Test script for TimeTrackingManager
 * Tests page time measurement, tab visibility detection, and duration tracking
 */

// Mock browser environment for Node.js testing
const { JSDOM } = require('jsdom');

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Import the TimeTrackingManager
const { 
  TimeTrackingManager, 
  getTimeTrackingManager, 
  initializeTimeTracking,
  formatDuration,
  isValidTrackingDuration 
} = require('./lib/time-tracking-manager.ts');

/**
 * Test suite for TimeTrackingManager
 */
async function runTests() {
  console.log('🧪 Starting TimeTrackingManager Tests\n');

  let testsPassed = 0;
  let testsTotal = 0;

  function test(name, testFn) {
    testsTotal++;
    try {
      console.log(`📋 Test: ${name}`);
      testFn();
      console.log(`✅ PASSED: ${name}\n`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test 1: Basic initialization
  test('TimeTrackingManager initialization', () => {
    const manager = new TimeTrackingManager({ debug: true });
    assert(!manager.isTracking(), 'Should not be tracking initially');
    assert(!manager.isActivelyTracking(), 'Should not be actively tracking initially');
    assert(manager.getCurrentDuration() === 0, 'Initial duration should be 0');
    assert(manager.getCurrentTrackingData() === null, 'Initial tracking data should be null');
  });

  // Test 2: Start and stop tracking
  test('Start and stop tracking', async () => {
    const manager = new TimeTrackingManager({ debug: true });
    const testUrl = 'https://example.com/test-page';
    
    // Start tracking
    manager.startTracking(testUrl);
    assert(manager.isTracking(), 'Should be tracking after start');
    assert(manager.isActivelyTracking(), 'Should be actively tracking');
    
    const trackingData = manager.getCurrentTrackingData();
    assert(trackingData !== null, 'Tracking data should not be null');
    assert(trackingData.pageUrl === testUrl, 'Page URL should match');
    assert(trackingData.isVisible === true, 'Should be visible initially');
    
    // Wait a bit and check duration
    await sleep(100);
    const duration = manager.getCurrentDuration();
    assert(duration > 0, 'Duration should be greater than 0');
    
    // Stop tracking
    const finalData = manager.stopTracking();
    assert(finalData !== null, 'Final data should not be null');
    assert(finalData.pageUrl === testUrl, 'Final page URL should match');
    assert(finalData.totalDuration > 0, 'Final duration should be greater than 0');
    assert(!manager.isTracking(), 'Should not be tracking after stop');
  });

  // Test 3: Visibility change handling
  test('Visibility change handling', () => {
    const events = {
      onVisibilityChange: null,
      visibilityChanges: []
    };
    
    events.onVisibilityChange = (isVisible, data) => {
      events.visibilityChanges.push({ isVisible, pageUrl: data.pageUrl });
    };

    const manager = new TimeTrackingManager({ debug: true }, events);
    const testUrl = 'https://example.com/visibility-test';
    
    manager.startTracking(testUrl);
    assert(manager.isActivelyTracking(), 'Should be actively tracking');
    
    // Simulate tab becoming hidden
    manager.pauseTracking();
    assert(manager.isTracking(), 'Should still be tracking when paused');
    assert(!manager.isActivelyTracking(), 'Should not be actively tracking when paused');
    
    // Simulate tab becoming visible again
    manager.resumeTracking();
    assert(manager.isActivelyTracking(), 'Should be actively tracking after resume');
    
    // Check visibility change events
    assert(events.visibilityChanges.length === 2, 'Should have 2 visibility changes');
    assert(events.visibilityChanges[0].isVisible === false, 'First change should be hidden');
    assert(events.visibilityChanges[1].isVisible === true, 'Second change should be visible');
    
    manager.stopTracking();
  });

  // Test 4: Duration calculation accuracy
  test('Duration calculation accuracy', async () => {
    const manager = new TimeTrackingManager({ debug: true });
    const testUrl = 'https://example.com/duration-test';
    
    manager.startTracking(testUrl);
    
    // Track for a known duration
    await sleep(200);
    
    const duration = manager.getCurrentDuration();
    assert(duration >= 200, `Duration should be at least 200ms, got ${duration}ms`);
    assert(duration < 300, `Duration should be less than 300ms, got ${duration}ms`);
    
    // Pause and resume to test active duration calculation
    manager.pauseTracking();
    await sleep(100); // This time should not count towards active duration
    manager.resumeTracking();
    await sleep(100);
    
    const finalData = manager.stopTracking();
    assert(finalData.totalDuration >= 400, 'Total duration should include paused time');
    assert(finalData.activeDuration < finalData.totalDuration, 'Active duration should be less than total');
  });

  // Test 5: Multiple page tracking
  test('Multiple page tracking', () => {
    const manager = new TimeTrackingManager({ debug: true });
    
    // Start tracking first page
    manager.startTracking('https://example.com/page1');
    assert(manager.isTracking(), 'Should be tracking page1');
    
    const firstData = manager.getCurrentTrackingData();
    assert(firstData.pageUrl === 'https://example.com/page1', 'Should be tracking page1');
    
    // Start tracking second page (should stop first)
    manager.startTracking('https://example.com/page2');
    assert(manager.isTracking(), 'Should be tracking page2');
    
    const secondData = manager.getCurrentTrackingData();
    assert(secondData.pageUrl === 'https://example.com/page2', 'Should be tracking page2');
    
    manager.stopTracking();
  });

  // Test 6: Event callbacks
  test('Event callbacks', () => {
    const events = {
      startCalled: false,
      stopCalled: false,
      updateCalled: false,
      startUrl: null,
      stopData: null
    };

    const manager = new TimeTrackingManager({ debug: true }, {
      onTrackingStart: (pageUrl) => {
        events.startCalled = true;
        events.startUrl = pageUrl;
      },
      onTrackingStop: (data) => {
        events.stopCalled = true;
        events.stopData = data;
      },
      onTimeUpdate: (data) => {
        events.updateCalled = true;
      }
    });

    const testUrl = 'https://example.com/events-test';
    
    manager.startTracking(testUrl);
    assert(events.startCalled, 'Start callback should be called');
    assert(events.startUrl === testUrl, 'Start callback should receive correct URL');
    
    const finalData = manager.stopTracking();
    assert(events.stopCalled, 'Stop callback should be called');
    assert(events.stopData !== null, 'Stop callback should receive data');
    assert(events.stopData.pageUrl === testUrl, 'Stop callback should receive correct data');
  });

  // Test 7: Options validation
  test('Options validation', () => {
    const manager = new TimeTrackingManager({
      enableVisibilityTracking: false,
      minTrackingTime: 2000,
      maxTrackingTime: 10000,
      debug: true
    });

    manager.startTracking('https://example.com/options-test');
    assert(manager.isTracking(), 'Should be tracking with custom options');
    
    manager.stopTracking();
  });

  // Test 8: Utility functions
  test('Utility functions', () => {
    // Test formatDuration
    assert(formatDuration(1000) === '1s', 'Should format 1 second correctly');
    assert(formatDuration(61000) === '1m 1s', 'Should format 1 minute 1 second correctly');
    assert(formatDuration(3661000) === '1h 1m 1s', 'Should format 1 hour 1 minute 1 second correctly');
    
    // Test isValidTrackingDuration
    assert(isValidTrackingDuration(1500, 1000), 'Should validate duration above minimum');
    assert(!isValidTrackingDuration(500, 1000), 'Should invalidate duration below minimum');
  });

  // Test 9: Global instance functions
  test('Global instance functions', () => {
    const manager1 = getTimeTrackingManager({ debug: true });
    const manager2 = getTimeTrackingManager({ debug: false });
    
    // Should return the same instance
    assert(manager1 === manager2, 'Should return the same global instance');
    
    const manager3 = initializeTimeTracking({ debug: true });
    assert(manager3 === manager1, 'Initialize should return the same global instance');
  });

  // Test 10: Destroy functionality
  test('Destroy functionality', () => {
    const manager = new TimeTrackingManager({ debug: true });
    
    manager.startTracking('https://example.com/destroy-test');
    assert(manager.isTracking(), 'Should be tracking before destroy');
    
    manager.destroy();
    assert(!manager.isTracking(), 'Should not be tracking after destroy');
  });

  // Print test results
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${testsPassed}/${testsTotal}`);
  console.log(`❌ Failed: ${testsTotal - testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! TimeTrackingManager is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };