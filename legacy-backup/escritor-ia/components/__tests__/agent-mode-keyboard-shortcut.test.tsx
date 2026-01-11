/**
 * Tests for Agent Mode Keyboard Shortcut
 * 
 * Validates Requirements: 3.1, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgentModeKeyboardShortcut } from '../../../hooks/useAgentModeKeyboardShortcut';

describe('Agent Mode Keyboard Shortcut', () => {
  let onToggleMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggleMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call onToggle when Shift+1 is pressed', () => {
    // Render the hook
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Simulate Shift+1 keypress
    const event = new KeyboardEvent('keydown', {
      key: '1',
      shiftKey: true,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was called
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it('should call onToggle when Shift+! is pressed (alternative)', () => {
    // Render the hook
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Simulate Shift+! keypress (some keyboards produce ! instead of 1)
    const event = new KeyboardEvent('keydown', {
      key: '!',
      shiftKey: true,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was called
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onToggle when only 1 is pressed without Shift', () => {
    // Render the hook
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Simulate 1 keypress without Shift
    const event = new KeyboardEvent('keydown', {
      key: '1',
      shiftKey: false,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was NOT called
    expect(onToggleMock).not.toHaveBeenCalled();
  });

  it('should not call onToggle when Shift is pressed with other keys', () => {
    // Render the hook
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Simulate Shift+2 keypress
    const event = new KeyboardEvent('keydown', {
      key: '2',
      shiftKey: true,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was NOT called
    expect(onToggleMock).not.toHaveBeenCalled();
  });

  it('should not call onToggle when disabled', () => {
    // Render the hook
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: false,
        onToggle: onToggleMock as () => void
      })
    );

    // Simulate Shift+1 keypress
    const event = new KeyboardEvent('keydown', {
      key: '1',
      shiftKey: true,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was NOT called
    expect(onToggleMock).not.toHaveBeenCalled();
  });

  it('should work globally within the document', () => {
    // Render the hook without targetRef (global)
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Simulate Shift+1 keypress on document
    const event = new KeyboardEvent('keydown', {
      key: '1',
      shiftKey: true,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was called
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior when Shift+1 is pressed', () => {
    // Render the hook
    renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Create event with preventDefault spy
    const event = new KeyboardEvent('keydown', {
      key: '1',
      shiftKey: true,
      bubbles: true,
      cancelable: true
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify preventDefault was called
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should cleanup event listener on unmount', () => {
    // Render the hook
    const { unmount } = renderHook(() =>
      useAgentModeKeyboardShortcut({
        enabled: true,
        onToggle: onToggleMock as () => void
      })
    );

    // Unmount the hook
    unmount();

    // Simulate Shift+1 keypress after unmount
    const event = new KeyboardEvent('keydown', {
      key: '1',
      shiftKey: true,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // Verify toggle was NOT called after unmount
    expect(onToggleMock).not.toHaveBeenCalled();
  });
});
