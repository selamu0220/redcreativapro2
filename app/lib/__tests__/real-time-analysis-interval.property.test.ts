/**
 * Property-Based Test: Real-Time Analysis Interval
 * Feature: irresistible-offer-system, Property 1: Consistent 2-second analysis interval
 * 
 * Validates: Requirements 1.1, 1.3
 * 
 * Property: For any active editor session, the AI_Writer should analyze text at regular
 * 2-second intervals while typing occurs, maintaining this cycle continuously without drift.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { RealTimeAnalysisEngine, AnalysisResult } from '../real-time-analysis-engine';

describe('Feature: irresistible-offer-system, Property 1: Consistent 2-second analysis interval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should maintain consistent 2-second intervals across multiple analysis cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random content with sufficient length
        fc.string({ minLength: 50, maxLength: 1000 }),
        // Generate number of intervals to test (5-20 cycles)
        fc.integer({ min: 5, max: 20 }),
        async (content, intervalCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            // Start the engine
            engine.start(callback);

            // Update content and wait for debounce to clear
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            // Simulate multiple interval cycles
            for (let i = 0; i < intervalCount; i++) {
              await vi.advanceTimersByTimeAsync(2000);
            }

            // Verify we got the expected number of analyses
            expect(timestamps.length).toBeGreaterThan(0);
            expect(timestamps.length).toBeLessThanOrEqual(intervalCount);

            // Verify intervals are consistently 2 seconds apart (±100ms tolerance)
            for (let i = 1; i < timestamps.length; i++) {
              const interval = timestamps[i] - timestamps[i - 1];
              expect(interval).toBeGreaterThanOrEqual(1900);
              expect(interval).toBeLessThanOrEqual(2100);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain interval consistency with varying content updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of content updates
        fc.array(
          fc.string({ minLength: 50, maxLength: 500 }),
          { minLength: 3, maxLength: 10 }
        ),
        // Generate interval count
        fc.integer({ min: 5, max: 10 }),
        async (contentUpdates, intervalCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            engine.start(callback);

            // Simulate typing with multiple content updates
            for (let i = 0; i < intervalCount; i++) {
              // Update content (simulating typing)
              const contentIndex = i % contentUpdates.length;
              engine.updateContent(contentUpdates[contentIndex]);
              
              // Wait for debounce to clear
              vi.advanceTimersByTime(300);
              
              // Advance to next interval
              await vi.advanceTimersByTimeAsync(1700); // 300 + 1700 = 2000
            }

            // Verify intervals remain consistent despite content changes
            for (let i = 1; i < timestamps.length; i++) {
              const interval = timestamps[i] - timestamps[i - 1];
              expect(interval).toBeGreaterThanOrEqual(1900);
              expect(interval).toBeLessThanOrEqual(2100);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should not drift over extended periods', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate content
        fc.string({ minLength: 100, maxLength: 500 }),
        // Generate long duration (10-20 intervals = 20-40 seconds)
        fc.integer({ min: 10, max: 20 }),
        async (content, intervalCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            // Run for extended period
            for (let i = 0; i < intervalCount; i++) {
              await vi.advanceTimersByTimeAsync(2000);
            }

            // Calculate average interval
            if (timestamps.length >= 2) {
              const totalTime = timestamps[timestamps.length - 1] - timestamps[0];
              const avgInterval = totalTime / (timestamps.length - 1);

              // Average should be very close to 2000ms (±50ms tolerance)
              expect(avgInterval).toBeGreaterThanOrEqual(1950);
              expect(avgInterval).toBeLessThanOrEqual(2050);

              // Check for drift: last interval should not deviate significantly
              const lastInterval = timestamps[timestamps.length - 1] - timestamps[timestamps.length - 2];
              expect(lastInterval).toBeGreaterThanOrEqual(1900);
              expect(lastInterval).toBeLessThanOrEqual(2100);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain interval when engine is restarted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 50, maxLength: 500 }),
        fc.integer({ min: 3, max: 7 }), // intervals before restart
        fc.integer({ min: 3, max: 7 }), // intervals after restart
        async (content, beforeCount, afterCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            // First session
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            for (let i = 0; i < beforeCount; i++) {
              await vi.advanceTimersByTimeAsync(2000);
            }

            const beforeTimestamps = [...timestamps];

            // Stop and restart
            engine.stop();
            timestamps.length = 0;
            
            engine.start(callback);
            engine.updateContent(content + ' updated');
            vi.advanceTimersByTime(300);

            for (let i = 0; i < afterCount; i++) {
              await vi.advanceTimersByTimeAsync(2000);
            }

            // Verify intervals in both sessions
            const verifyIntervals = (ts: number[]) => {
              for (let i = 1; i < ts.length; i++) {
                const interval = ts[i] - ts[i - 1];
                expect(interval).toBeGreaterThanOrEqual(1900);
                expect(interval).toBeLessThanOrEqual(2100);
              }
            };

            if (beforeTimestamps.length >= 2) {
              verifyIntervals(beforeTimestamps);
            }
            if (timestamps.length >= 2) {
              verifyIntervals(timestamps);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain interval with different configuration values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 50, maxLength: 500 }),
        // Test with various interval values (1000-3000ms)
        fc.integer({ min: 1000, max: 3000 }),
        fc.integer({ min: 5, max: 10 }),
        async (content, intervalMs, cycleCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: intervalMs,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            engine.start(callback);
            engine.updateContent(content);
            vi.advanceTimersByTime(300);

            for (let i = 0; i < cycleCount; i++) {
              await vi.advanceTimersByTimeAsync(intervalMs);
            }

            // Verify intervals match configured value (±5% tolerance)
            const tolerance = intervalMs * 0.05;
            for (let i = 1; i < timestamps.length; i++) {
              const interval = timestamps[i] - timestamps[i - 1];
              expect(interval).toBeGreaterThanOrEqual(intervalMs - tolerance);
              expect(interval).toBeLessThanOrEqual(intervalMs + tolerance);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle rapid content updates without affecting interval timing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 20, maxLength: 200 }),
          { minLength: 5, maxLength: 15 }
        ),
        fc.integer({ min: 5, max: 10 }),
        async (contentUpdates, intervalCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            engine.start(callback);

            for (let i = 0; i < intervalCount; i++) {
              // Simulate rapid typing (multiple updates within debounce window)
              for (let j = 0; j < 3; j++) {
                const contentIndex = (i * 3 + j) % contentUpdates.length;
                engine.updateContent(contentUpdates[contentIndex]);
                vi.advanceTimersByTime(50); // Rapid updates
              }

              // Wait for debounce to clear
              vi.advanceTimersByTime(300);

              // Advance to next interval
              await vi.advanceTimersByTimeAsync(1550); // 50*3 + 300 + 1550 = 2000
            }

            // Verify intervals remain consistent despite rapid updates
            for (let i = 1; i < timestamps.length; i++) {
              const interval = timestamps[i] - timestamps[i - 1];
              expect(interval).toBeGreaterThanOrEqual(1900);
              expect(interval).toBeLessThanOrEqual(2100);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should skip intervals when content is too short but resume when valid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 5 }), // Short content
        fc.string({ minLength: 50, maxLength: 500 }), // Valid content
        fc.integer({ min: 3, max: 7 }),
        async (shortContent, validContent, intervalCount) => {
          const engine = new RealTimeAnalysisEngine({
            interval: 2000,
            debounceDelay: 300,
            minContentLength: 10,
            enabled: true
          });

          const timestamps: number[] = [];
          const callback = vi.fn((result: AnalysisResult) => {
            timestamps.push(Date.now());
          });

          try {
            engine.start(callback);

            // Start with short content (should not trigger analysis)
            engine.updateContent(shortContent);
            vi.advanceTimersByTime(300);
            await vi.advanceTimersByTimeAsync(2000);

            expect(timestamps.length).toBe(0);

            // Switch to valid content
            engine.updateContent(validContent);
            vi.advanceTimersByTime(300);

            // Now intervals should work normally
            for (let i = 0; i < intervalCount; i++) {
              await vi.advanceTimersByTimeAsync(2000);
            }

            // Verify intervals are consistent once valid content is provided
            for (let i = 1; i < timestamps.length; i++) {
              const interval = timestamps[i] - timestamps[i - 1];
              expect(interval).toBeGreaterThanOrEqual(1900);
              expect(interval).toBeLessThanOrEqual(2100);
            }
          } finally {
            engine.stop();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
