/**
 * Unit Tests for Real-Time Analysis Engine
 * 
 * Tests core functionality:
 * - Engine initialization
 * - Start/stop lifecycle
 * - Content updates
 * - Analysis triggering
 * - Configuration updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealTimeAnalysisEngine, AnalysisResult } from '../real-time-analysis-engine';

describe('RealTimeAnalysisEngine', () => {
  let engine: RealTimeAnalysisEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new RealTimeAnalysisEngine({
      interval: 2000,
      debounceDelay: 300,
      minContentLength: 10,
      enabled: true
    });
  });

  afterEach(() => {
    engine.stop();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create engine with default config', () => {
      const defaultEngine = new RealTimeAnalysisEngine();
      expect(defaultEngine).toBeDefined();
      expect(defaultEngine.isRunning()).toBe(false);
    });

    it('should create engine with custom config', () => {
      const config = engine.getConfig();
      expect(config.interval).toBe(2000);
      expect(config.debounceDelay).toBe(300);
      expect(config.minContentLength).toBe(10);
      expect(config.enabled).toBe(true);
    });
  });

  describe('Lifecycle Management', () => {
    it('should start engine successfully', () => {
      const callback = vi.fn();
      engine.start(callback);
      expect(engine.isRunning()).toBe(true);
    });

    it('should stop engine successfully', () => {
      const callback = vi.fn();
      engine.start(callback);
      engine.stop();
      expect(engine.isRunning()).toBe(false);
    });

    it('should not start engine twice', () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      engine.start(callback);
      engine.start(callback);
      
      expect(consoleSpy).toHaveBeenCalledWith('Analysis engine already running');
      consoleSpy.mockRestore();
    });
  });

  describe('Content Updates', () => {
    it('should update content without triggering immediate analysis', () => {
      const callback = vi.fn();
      engine.start(callback);
      
      engine.updateContent('This is test content for analysis');
      
      // Should not trigger immediately due to debounce
      expect(callback).not.toHaveBeenCalled();
    });

    it('should respect debounce delay', () => {
      const callback = vi.fn();
      engine.start(callback);
      
      engine.updateContent('First update');
      vi.advanceTimersByTime(100);
      
      engine.updateContent('Second update');
      vi.advanceTimersByTime(100);
      
      engine.updateContent('Third update');
      vi.advanceTimersByTime(300);
      
      // Debounce should have cleared, but interval hasn't triggered yet
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Analysis Triggering', () => {
    it('should trigger analysis after interval when content is ready', async () => {
      const callback = vi.fn();
      engine.start(callback);
      
      // Update content and wait for debounce
      engine.updateContent('This is test content for analysis');
      vi.advanceTimersByTime(300);
      
      // Advance to trigger interval
      await vi.advanceTimersByTimeAsync(2000);
      
      // Should have triggered analysis
      expect(callback).toHaveBeenCalled();
    });

    it('should not trigger analysis for short content', async () => {
      const callback = vi.fn();
      engine.start(callback);
      
      // Update with content shorter than minContentLength
      engine.updateContent('Short');
      vi.advanceTimersByTime(300);
      
      // Advance to trigger interval
      await vi.advanceTimersByTimeAsync(2000);
      
      // Should not have triggered analysis
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not trigger analysis while debouncing', async () => {
      const callback = vi.fn();
      engine.start(callback);
      
      // Update content but don't wait for debounce
      engine.updateContent('This is test content for analysis');
      
      // Advance to trigger interval (but debounce is still active)
      await vi.advanceTimersByTimeAsync(2000);
      
      // Should not have triggered analysis
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not analyze same content twice', async () => {
      const callback = vi.fn();
      engine.start(callback);
      
      // First analysis
      engine.updateContent('This is test content for analysis');
      vi.advanceTimersByTime(300);
      await vi.advanceTimersByTimeAsync(2000);
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Try to analyze same content again
      await vi.advanceTimersByTimeAsync(2000);
      
      // Should not trigger second analysis
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      engine.updateConfig({ interval: 3000 });
      const config = engine.getConfig();
      expect(config.interval).toBe(3000);
    });

    it('should restart engine when interval changes', () => {
      const callback = vi.fn();
      engine.start(callback);
      
      expect(engine.isRunning()).toBe(true);
      
      engine.updateConfig({ interval: 3000 });
      
      // Engine should still be running with new interval
      expect(engine.isRunning()).toBe(true);
    });

    it('should stop engine when disabled', () => {
      const callback = vi.fn();
      engine.start(callback);
      
      engine.updateConfig({ enabled: false });
      
      expect(engine.isRunning()).toBe(false);
    });
  });

  describe('Force Analysis', () => {
    it('should perform immediate analysis', async () => {
      const content = 'This is test content for immediate analysis';
      
      // Call forceAnalysis and advance timers to resolve the promise
      const resultPromise = engine.forceAnalysis(content);
      await vi.advanceTimersByTimeAsync(10);
      const result = await resultPromise;
      
      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.contentHash).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should return analysis result with correct structure', async () => {
      const content = 'Test content';
      
      // Call forceAnalysis and advance timers to resolve the promise
      const resultPromise = engine.forceAnalysis(content);
      await vi.advanceTimersByTimeAsync(10);
      const result = await resultPromise;
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('contentHash');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('processingTime');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('State Queries', () => {
    it('should report running state correctly', () => {
      expect(engine.isRunning()).toBe(false);
      
      const callback = vi.fn();
      engine.start(callback);
      expect(engine.isRunning()).toBe(true);
      
      engine.stop();
      expect(engine.isRunning()).toBe(false);
    });

    it('should report processing state correctly', () => {
      expect(engine.isProcessing()).toBe(false);
    });

    it('should track time since last analysis', async () => {
      const callback = vi.fn();
      engine.start(callback);
      
      // Initially should be Infinity
      expect(engine.getTimeSinceLastAnalysis()).toBe(Infinity);
      
      // Perform analysis
      engine.updateContent('This is test content for analysis');
      vi.advanceTimersByTime(300);
      await vi.advanceTimersByTimeAsync(2000);
      
      // Should have a finite time
      expect(engine.getTimeSinceLastAnalysis()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should call error callback on analysis failure', async () => {
      const callback = vi.fn();
      const errorCallback = vi.fn();
      
      // Mock the analysis to throw an error
      const originalMethod = engine['runAnalysisInBackground'];
      engine['runAnalysisInBackground'] = vi.fn().mockRejectedValue(new Error('Analysis failed'));
      
      engine.start(callback, errorCallback);
      
      engine.updateContent('This is test content for analysis');
      vi.advanceTimersByTime(300);
      await vi.advanceTimersByTimeAsync(2000);
      
      // Wait a bit for async error handling with a limit
      await vi.advanceTimersByTimeAsync(100);
      
      expect(errorCallback).toHaveBeenCalled();
      
      // Restore original method
      engine['runAnalysisInBackground'] = originalMethod;
    });
  });
});
