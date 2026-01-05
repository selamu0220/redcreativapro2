/**
 * React Hook for Agent Mode Activation
 * 
 * Provides a React-friendly interface to the Agent Mode Activation Manager
 * with automatic lifecycle management and state updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AgentModeActivationManager,
  AgentModeConfig,
  AgentModeStatus
} from '../lib/agent-mode-activation';

export interface UseAgentModeActivationOptions {
  enabled?: boolean;
  autoActivate?: boolean;
  activationDelay?: number;
  onAgentModeChange?: (isActive: boolean) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export interface UseAgentModeActivationReturn {
  isActive: boolean;
  isEnabled: boolean;
  autoActivate: boolean;
  isTyping: boolean;
  timeSinceLastTyping: number;
  willActivateIn: number;
  onTyping: () => void;
  activateManually: () => void;
  deactivateManually: () => void;
  setEnabled: (enabled: boolean) => void;
  setAutoActivate: (autoActivate: boolean) => void;
  toggleEnabled: () => void;
  status: AgentModeStatus;
}

/**
 * Hook for integrating agent mode activation into React components
 * 
 * @param options - Configuration options
 * @returns Agent mode state and control functions
 */
export function useAgentModeActivation(
  options: UseAgentModeActivationOptions = {}
): UseAgentModeActivationReturn {
  const {
    enabled = true,
    autoActivate = true,
    activationDelay = 3000,
    onAgentModeChange,
    onTypingChange
  } = options;

  // State
  const [isActive, setIsActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [autoActivateState, setAutoActivateState] = useState(autoActivate);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<AgentModeStatus>({
    isActive: false,
    isEnabled: enabled,
    autoActivate: autoActivate,
    timeSinceLastTyping: Infinity,
    willActivateIn: 0
  });

  // Refs
  const managerRef = useRef<AgentModeActivationManager | null>(null);
  const statusUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize manager
  useEffect(() => {
    const config: Partial<AgentModeConfig> = {
      enabled: isEnabled,
      autoActivate: autoActivateState,
      activationDelay
    };

    managerRef.current = new AgentModeActivationManager(config);

    // Start manager with callbacks
    const handleAgentModeChange = (active: boolean) => {
      setIsActive(active);
      if (onAgentModeChange) {
        onAgentModeChange(active);
      }
    };

    const handleTypingChange = (typing: boolean) => {
      setIsTyping(typing);
      if (onTypingChange) {
        onTypingChange(typing);
      }
    };

    const handleEnabledChange = (enabled: boolean) => {
      setIsEnabled(enabled);
    };

    managerRef.current.start(handleAgentModeChange, handleTypingChange, handleEnabledChange);

    // Update status periodically for UI updates (countdown timers, etc.)
    statusUpdateIntervalRef.current = setInterval(() => {
      if (managerRef.current) {
        setStatus(managerRef.current.getStatus());
      }
    }, 100); // Update every 100ms for smooth UI

    // Cleanup
    return () => {
      if (managerRef.current) {
        managerRef.current.stop();
      }
      if (statusUpdateIntervalRef.current) {
        clearInterval(statusUpdateIntervalRef.current);
      }
    };
  }, [activationDelay, isEnabled, autoActivateState, onAgentModeChange, onTypingChange]);

  // Handle typing event
  const handleTyping = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.onTyping();
    }
  }, []);

  // Manual activation
  const activateManually = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.activateManually();
    }
  }, []);

  // Manual deactivation
  const deactivateManually = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.deactivateManually();
    }
  }, []);

  // Enable/disable agent mode
  const handleSetEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (managerRef.current) {
      managerRef.current.updateConfig({ enabled });
    }
  }, []);

  // Enable/disable auto-activation
  const handleSetAutoActivate = useCallback((autoActivate: boolean) => {
    setAutoActivateState(autoActivate);
    if (managerRef.current) {
      managerRef.current.updateConfig({ autoActivate });
    }
  }, []);

  // Toggle enabled state (for keyboard shortcut)
  const handleToggleEnabled = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.toggleEnabled();
    }
  }, []);

  return {
    isActive,
    isEnabled,
    autoActivate: autoActivateState,
    isTyping,
    timeSinceLastTyping: status.timeSinceLastTyping,
    willActivateIn: status.willActivateIn,
    onTyping: handleTyping,
    activateManually,
    deactivateManually,
    setEnabled: handleSetEnabled,
    setAutoActivate: handleSetAutoActivate,
    toggleEnabled: handleToggleEnabled,
    status
  };
}
