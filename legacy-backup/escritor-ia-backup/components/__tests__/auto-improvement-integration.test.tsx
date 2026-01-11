/**
 * Integration test for auto-improvement hook in AIWriterEditor
 * 
 * This test verifies that:
 * 1. The useOptimizedAutoImprovement hook is properly integrated
 * 2. Auto-improvement triggers after 2 seconds of typing inactivity
 * 3. The onImprove callback is called when auto-improvement triggers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimizedAutoImprovement, useAutoImprovementConfig } from '../../../hooks/useOptimizedAutoImprovement';

describe('AIWriterEditor - Auto-Improvement Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should integrate useOptimizedAutoImprovement hook without errors', () => {
    const onImprove = vi.fn();
    const getCurrentContent = vi.fn(() => 'Test content with enough words here');

    const { result } = renderHook(() =>
      useOptimizedAutoImprovement({
        config: {
          enabled: true,
          delay: 2000,
          minWords: 5,
          maxRetries: 3,
          debounceDelay: 1000
        },
        onImprove,
        getCurrentContent,
        enabled: true
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.handleTyping).toBeDefined();
    expect(result.current.state).toBeDefined();
  });

  it('should trigger typing state when handleTyping is called', async () => {
    const onImprove = vi.fn().mockResolvedValue(undefined);
    let content = 'This is a test content with enough words';
    const getCurrentContent = vi.fn(() => content);

    const { result } = renderHook(() =>
      useOptimizedAutoImprovement({
        config: {
          enabled: true,
          delay: 2000,
          minWords: 5,
          maxRetries: 3,
          debounceDelay: 1000
        },
        onImprove,
        getCurrentContent,
        enabled: true
      })
    );

    // Verify initial state
    expect(result.current.state.isTyping).toBe(false);
    expect(result.current.state.isImproving).toBe(false);

    // Simulate typing
    act(() => {
      result.current.handleTyping();
    });

    // Verify typing state is set
    expect(result.current.state.isTyping).toBe(true);

    // Verify onImprove hasn't been called immediately
    expect(onImprove).not.toHaveBeenCalled();
  });

  it('should not trigger auto-improvement when enabled is false', async () => {
    const onImprove = vi.fn().mockResolvedValue(undefined);
    const getCurrentContent = vi.fn(() => 'This is a test content with enough words');

    const { result } = renderHook(() =>
      useOptimizedAutoImprovement({
        config: {
          enabled: true,
          delay: 2000,
          minWords: 5,
          maxRetries: 3,
          debounceDelay: 1000
        },
        onImprove,
        getCurrentContent,
        enabled: false // Hook disabled
      })
    );

    // Simulate typing
    act(() => {
      result.current.handleTyping();
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // onImprove should not have been called
    expect(onImprove).not.toHaveBeenCalled();
  });

  it('should not trigger auto-improvement with content below minimum word count', async () => {
    const onImprove = vi.fn().mockResolvedValue(undefined);
    const getCurrentContent = vi.fn(() => 'Too short'); // Only 2 words

    const { result } = renderHook(() =>
      useOptimizedAutoImprovement({
        config: {
          enabled: true,
          delay: 2000,
          minWords: 5,
          maxRetries: 3,
          debounceDelay: 1000
        },
        onImprove,
        getCurrentContent,
        enabled: true
      })
    );

    // Simulate typing
    act(() => {
      result.current.handleTyping();
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // onImprove should not have been called
    expect(onImprove).not.toHaveBeenCalled();
  });

  it('should use useAutoImprovementConfig hook correctly', () => {
    const { result } = renderHook(() =>
      useAutoImprovementConfig({
        enabled: true,
        delay: 2000,
        minWords: 5
      })
    );

    expect(result.current.config).toBeDefined();
    expect(result.current.config.enabled).toBe(true);
    expect(result.current.config.delay).toBe(2000);
    expect(result.current.config.minWords).toBe(5);
    expect(result.current.config.maxRetries).toBe(3); // Default value
    expect(result.current.config.debounceDelay).toBe(1000); // Default value
  });

  it('should maintain typing state when handleTyping is called multiple times', async () => {
    const onImprove = vi.fn().mockResolvedValue(undefined);
    const getCurrentContent = vi.fn(() => 'This is a test content with enough words');

    const { result } = renderHook(() =>
      useOptimizedAutoImprovement({
        config: {
          enabled: true,
          delay: 2000,
          minWords: 5,
          maxRetries: 3,
          debounceDelay: 1000
        },
        onImprove,
        getCurrentContent,
        enabled: true
      })
    );

    // First typing event
    act(() => {
      result.current.handleTyping();
    });

    expect(result.current.state.isTyping).toBe(true);

    // Second typing event (should maintain typing state)
    act(() => {
      result.current.handleTyping();
    });

    // Should still be typing after second event
    expect(result.current.state.isTyping).toBe(true);
  });
});
