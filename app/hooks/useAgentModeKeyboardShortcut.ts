/**
 * React Hook for Agent Mode Keyboard Shortcut
 * 
 * Handles the Shift+1 keyboard shortcut for toggling agent mode.
 * Works globally within the editor component.
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.5
 */

import { useEffect, useCallback, useRef } from 'react';

export interface UseAgentModeKeyboardShortcutOptions {
  enabled?: boolean;
  onToggle: () => void;
  targetRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook for handling Shift+1 keyboard shortcut to toggle agent mode
 * 
 * @param options - Configuration options
 */
export function useAgentModeKeyboardShortcut({
  enabled = true,
  onToggle,
  targetRef
}: UseAgentModeKeyboardShortcutOptions): void {
  const onToggleRef = useRef(onToggle);

  // Keep ref updated
  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  // Handle keyboard event
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check for Shift+1 combination
    // Shift key + '1' key (key code 49 or key '1')
    if (event.shiftKey && (event.key === '1' || event.key === '!' || event.code === 'Digit1')) {
      // Prevent default behavior
      event.preventDefault();
      event.stopPropagation();

      // Toggle agent mode
      if (onToggleRef.current) {
        onToggleRef.current();
      }

      console.log('Agent mode toggled via Shift+1 keyboard shortcut');
    }
  }, []);

  // Set up keyboard event listener
  useEffect(() => {
    if (!enabled) return;

    const target = targetRef?.current || document;

    // Add event listener
    target.addEventListener('keydown', handleKeyDown as any);

    console.log('Agent mode keyboard shortcut (Shift+1) registered');

    // Cleanup
    return () => {
      target.removeEventListener('keydown', handleKeyDown as any);
      console.log('Agent mode keyboard shortcut (Shift+1) unregistered');
    };
  }, [enabled, handleKeyDown, targetRef]);
}

/**
 * Hook for displaying keyboard shortcut hint
 * 
 * Returns formatted shortcut text for display in UI
 */
export function useAgentModeShortcutHint(): string {
  // Detect platform for display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  
  return isMac ? '⇧1' : 'Shift+1';
}
