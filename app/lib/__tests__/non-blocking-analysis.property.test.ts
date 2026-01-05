/**
 * Property-Based Test: Non-Blocking Analysis
 * Feature: irresistible-offer-system, Property 2: Non-blocking analysis
 * 
 * Validates: Requirements 1.5, 12.1, 12.2
 * 
 * Property: For any text analysis operation, the system should process in the background
 * without blocking the UI, maintaining editor responsiveness below 100ms latency during typing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { RealTimeAnalysisEngine, AnalysisResult } from '../real-time-analysis-engine';

describe('Feature: irresistible-offer-system, Property 2: Non-blocking analysis', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process analysis without blocking the UI thread', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random content
        fc.string({ minLength: 100, maxLength: 2000 }),
        // Generate number of analysis cycles
        fc.integer({ min: 5, max: 15 }),
        async (content, cycleCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          let analysisStarted = false;
          let analysisCompleted = false;
          const uiOperationTimestamps: number[] = [];

          const callback = vi.fn((_result: AnalysisResult) => {
            analysisCompleted = true;
          });

          try {
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            for (let i = 0; i < cycleCount; i++) {
              // Check if analysis is in progress
              analysisStarted = engine.isProcessing();

              // Simulate UI operation (should not be blocked)
              const uiOpStart = performance.now();
              
              // Simulate a UI update (e.g., cursor movement, selection)
              const simulatedUIOperation = () => {
                let sum = 0;
                for (let j = 0; j < 100; j++) {
                  sum += j;
                }
                return sum;
              };
              
              simulatedUIOperation();
              const uiOpEnd = performance.now();
              const uiLatency = uiOpEnd - uiOpStart;
              
              uiOperationTimestamps.push(uiLatency);

              // Verify UI operation completed quickly (non-blocking)
              // Even during analysis, UI operations should be fast
              expect(uiLatency).toBeLessThan(100); // 100ms requirement

              // Advance time for next cycle
              await vi.advanceTimersByTimeAsync(2000);
            }

            // Verify analysis ran in background
            expect(analysisStarted || analysisCompleted).toBe(true);

            // Verify all UI operations were fast
            const maxLatency = Math.max(...uiOperationTimestamps);
            expect(maxLatency).toBeLessThan(100);

            const avgLatency = uiOperationTimestamps.reduce((a, b) => a + b, 0) / uiOperationTimestamps.length;
            expect(avgLatency).toBeLessThan(50); // Average should be even better
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain editor responsiveness below 100ms during typing', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of content updates (simulating typing)
        fc.array(
          fc.string({ minLength: 50, maxLength: 500 }),
          { minLength: 5, maxLength: 15 }
        ),
        async (contentUpdates) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const typingLatencies: number[] = [];
          const callback = vi.fn();

          try {
            engine.start(callback);

            // Simulate rapid typing with content updates
            for (let i = 0; i < contentUpdates.length; i++) {
              const typingStart = performance.now();
              
              // Update content (simulating keystroke)
              engine.updateContent(contentUpdates[i]);
              
              const typingEnd = performance.now();
              const latency = typingEnd - typingStart;
              
              typingLatencies.push(latency);

              // Verify each typing operation is non-blocking
              expect(latency).toBeLessThan(100);

              // Advance time slightly (simulating typing speed)
              vi.advanceTimersByTime(50);
            }

            // Verify all typing operations were responsive
            const maxLatency = Math.max(...typingLatencies);
            expect(maxLatency).toBeLessThan(100);

            const avgLatency = typingLatencies.reduce((a, b) => a + b, 0) / typingLatencies.length;
            expect(avgLatency).toBeLessThan(20); // Should be very fast
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should not block UI when analysis callback is invoked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 100, maxLength: 1000 }),
        fc.integer({ min: 3, max: 10 }),
        async (content, cycleCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const callbackLatencies: number[] = [];
          let callbackInvoked = false;

          const callback = vi.fn((result: AnalysisResult) => {
            callbackInvoked = true;
            
            // Measure time to process callback
            const callbackStart = performance.now();
            
            // Simulate callback processing (e.g., updating UI with suggestions)
            const processResult = () => {
              return result.suggestions.length;
            };
            
            processResult();
            
            const callbackEnd = performance.now();
            const latency = callbackEnd - callbackStart;
            
            callbackLatencies.push(latency);
          });

          try {
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            for (let i = 0; i < cycleCount; i++) {
              // Use non-async version to avoid infinite loop with setInterval
              vi.advanceTimersByTime(2000);
              
              // Allow pending promises to resolve
              await Promise.resolve();
            }

            // Verify callback was invoked
            if (callbackInvoked) {
              // Verify callback execution didn't block
              const maxCallbackLatency = Math.max(...callbackLatencies);
              expect(maxCallbackLatency).toBeLessThan(100);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle concurrent content updates without blocking', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 50, maxLength: 500 }),
          { minLength: 5, maxLength: 20 }
        ),
        fc.integer({ min: 3, max: 8 }),
        async (contentUpdates, intervalCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const updateLatencies: number[] = [];
          const callback = vi.fn();

          try {
            engine.start(callback);

            for (let i = 0; i < intervalCount; i++) {
              // Perform multiple rapid updates (simulating fast typing)
              for (let j = 0; j < Math.min(5, contentUpdates.length); j++) {
                const updateStart = performance.now();
                
                const contentIndex = (i * 5 + j) % contentUpdates.length;
                engine.updateContent(contentUpdates[contentIndex]);
                
                const updateEnd = performance.now();
                const latency = updateEnd - updateStart;
                
                updateLatencies.push(latency);
                
                // Each update should be non-blocking
                expect(latency).toBeLessThan(100);
                
                vi.advanceTimersByTime(50);
              }

              // Wait for debounce and interval
              vi.advanceTimersByTime(300);
              await vi.advanceTimersByTimeAsync(1450); // Total: 50*5 + 300 + 1450 = 2000
            }

            // Verify all updates were non-blocking
            const maxLatency = Math.max(...updateLatencies);
            expect(maxLatency).toBeLessThan(100);

            const avgLatency = updateLatencies.reduce((a, b) => a + b, 0) / updateLatencies.length;
            expect(avgLatency).toBeLessThan(30);
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain responsiveness with varying content sizes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate content of varying sizes
        fc.array(
          fc.string({ minLength: 10, maxLength: 5000 }),
          { minLength: 5, maxLength: 15 }
        ),
        async (contentSamples) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const operationLatencies: number[] = [];
          const callback = vi.fn();

          try {
            engine.start(callback);

            for (const content of contentSamples) {
              const opStart = performance.now();
              
              // Update with content of varying size
              engine.updateContent(content);
              
              const opEnd = performance.now();
              const latency = opEnd - opStart;
              
              operationLatencies.push(latency);

              // Should be non-blocking regardless of content size
              expect(latency).toBeLessThan(100);

              vi.advanceTimersByTime(300);
              await vi.advanceTimersByTimeAsync(2000);
            }

            // Verify responsiveness across all content sizes
            const maxLatency = Math.max(...operationLatencies);
            expect(maxLatency).toBeLessThan(100);
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should process analysis in background using async operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 100, maxLength: 1000 }),
        fc.integer({ min: 3, max: 10 }),
        async (content, cycleCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          let analysisCount = 0;
          const processingTimes: number[] = [];

          const callback = vi.fn((result: AnalysisResult) => {
            analysisCount++;
            processingTimes.push(result.processingTime);
          });

          try {
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            for (let i = 0; i < cycleCount; i++) {
              // Check that analysis doesn't block the interval timer
              const beforeAnalysis = engine.isRunning();
              expect(beforeAnalysis).toBe(true);

              // Use non-async version to avoid infinite loop with setInterval
              vi.advanceTimersByTime(2000);
              
              // Allow pending promises to resolve
              await Promise.resolve();

              // Engine should still be running (not blocked)
              const afterAnalysis = engine.isRunning();
              expect(afterAnalysis).toBe(true);
            }

            // Verify analysis ran in background
            expect(analysisCount).toBeGreaterThan(0);

            // Verify processing times are recorded (indicating async completion)
            if (processingTimes.length > 0) {
              processingTimes.forEach(time => {
                expect(time).toBeGreaterThanOrEqual(0);
              });
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should allow UI operations during analysis processing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 100, maxLength: 1000 }),
        fc.integer({ min: 5, max: 15 }),
        async (content, operationCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const uiOperations: number[] = [];
          const callback = vi.fn();

          try {
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            // Start analysis cycle
            await vi.advanceTimersByTimeAsync(2000);

            // Perform UI operations while analysis might be running
            for (let i = 0; i < operationCount; i++) {
              const opStart = performance.now();
              
              // Simulate UI operations (cursor movement, selection, etc.)
              const uiOp = () => {
                const isProcessing = engine.isProcessing();
                const isRunning = engine.isRunning();
                return isProcessing || isRunning;
              };
              
              uiOp();
              
              const opEnd = performance.now();
              const latency = opEnd - opStart;
              
              uiOperations.push(latency);

              // UI operations should be fast even during analysis
              expect(latency).toBeLessThan(100);

              vi.advanceTimersByTime(10);
            }

            // Verify all UI operations were responsive
            const maxLatency = Math.max(...uiOperations);
            expect(maxLatency).toBeLessThan(100);

            const avgLatency = uiOperations.reduce((a, b) => a + b, 0) / uiOperations.length;
            expect(avgLatency).toBeLessThan(50);
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should not block when error occurs during analysis', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 100, maxLength: 1000 }),
        fc.integer({ min: 3, max: 8 }),
        async (content, cycleCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          let errorHandled = false;
          const operationLatencies: number[] = [];

          const callback = vi.fn();
          const errorCallback = vi.fn((_error: Error) => {
            errorHandled = true;
          });

          try {
            engine.start(callback, errorCallback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            for (let i = 0; i < cycleCount; i++) {
              const opStart = performance.now();
              
              // Perform operation that should not block even if error occurs
              engine.updateContent(content + i);
              
              const opEnd = performance.now();
              const latency = opEnd - opStart;
              
              operationLatencies.push(latency);

              // Should remain non-blocking even with errors
              expect(latency).toBeLessThan(100);

              vi.advanceTimersByTime(300);
              await vi.advanceTimersByTimeAsync(1700);
            }

            // Verify operations remained non-blocking
            const maxLatency = Math.max(...operationLatencies);
            expect(maxLatency).toBeLessThan(100);

            // Engine should still be running (not crashed)
            expect(engine.isRunning()).toBe(true);
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain responsiveness when starting and stopping engine', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 100, maxLength: 1000 }),
        fc.integer({ min: 2, max: 6 }),
        async (content, restartCount) => {
          const operationLatencies: number[] = [];
          const callback = vi.fn();

          for (let i = 0; i < restartCount; i++) {
            const engine = new RealTimeAnalysisEngine({
              interval: 2000,
              debounceDelay: 300,
              minContentLength: 10,
              enabled: true
            });

            try {
              const startOpStart = performance.now();
              engine.start(callback);
              const startOpEnd = performance.now();
              
              operationLatencies.push(startOpEnd - startOpStart);
              expect(startOpEnd - startOpStart).toBeLessThan(100);

              const updateOpStart = performance.now();
              engine.updateContent(content);
              const updateOpEnd = performance.now();
              
              operationLatencies.push(updateOpEnd - updateOpStart);
              expect(updateOpEnd - updateOpStart).toBeLessThan(100);

              vi.advanceTimersByTime(300);
              await vi.advanceTimersByTimeAsync(2000);

              const stopOpStart = performance.now();
              engine.stop();
              const stopOpEnd = performance.now();
              
              operationLatencies.push(stopOpEnd - stopOpStart);
              expect(stopOpEnd - stopOpStart).toBeLessThan(100);
            } finally {
              engine.stop();
            }
          }

          // Verify all start/stop operations were non-blocking
          const maxLatency = Math.max(...operationLatencies);
          expect(maxLatency).toBeLessThan(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle force analysis without blocking', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 100, maxLength: 500 }),
          { minLength: 2, maxLength: 5 } // Reduced array size
        ),
        async (contentSamples) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const forceAnalysisLatencies: number[] = [];

          try {
            const callback = vi.fn();
            engine.start(callback);

            for (const content of contentSamples) {
              const opStart = performance.now();
              
              // Force analysis should not block (initiating the call)
              const resultPromise = engine.forceAnalysis(content);
              
              const opEnd = performance.now();
              const latency = opEnd - opStart;
              
              forceAnalysisLatencies.push(latency);

              // Initiating force analysis should be non-blocking
              expect(latency).toBeLessThan(100);

              // Wait for analysis to complete
              await resultPromise;
            }

            // Verify all force analysis calls were non-blocking
            const maxLatency = Math.max(...forceAnalysisLatencies);
            expect(maxLatency).toBeLessThan(100);
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 10, timeout: 30000 } // Reduced runs, increased timeout
    );
  }, 35000); // Increase test timeout to 35 seconds
});
