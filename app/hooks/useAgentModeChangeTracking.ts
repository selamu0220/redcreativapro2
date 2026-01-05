/**
 * React Hook for Agent Mode Change Tracking
 * 
 * Provides a React-friendly interface to the Agent Mode Change Tracker
 * with automatic lifecycle management and state updates.
 * 
 * Requirements: 2.3, 2.4
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AgentModeChangeTracker,
  AgentModeSession,
  TextChange,
  ChangesSummary
} from '../lib/agent-mode-change-tracking';

export interface UseAgentModeChangeTrackingOptions {
  onSessionChange?: (session: AgentModeSession) => void;
}

export interface UseAgentModeChangeTrackingReturn {
  currentSession: AgentModeSession | null;
  startSession: (originalContent: string) => string;
  addChange: (change: Omit<TextChange, 'id' | 'timestamp'>) => void;
  completeSession: (modifiedContent: string) => void;
  applyAllChanges: (sessionId: string, currentContent: string) => string;
  applyChanges: (sessionId: string, changeIds: string[], currentContent: string) => string;
  revertAllChanges: (sessionId: string, currentContent: string) => string;
  revertChanges: (sessionId: string, changeIds: string[], currentContent: string) => string;
  undo: () => string | null;
  redo: () => string | null;
  canUndo: boolean;
  canRedo: boolean;
  getChangesSummary: (sessionId: string) => ChangesSummary;
  clear: () => void;
}

/**
 * Hook for integrating agent mode change tracking into React components
 * 
 * @param options - Configuration options
 * @returns Change tracking state and control functions
 */
export function useAgentModeChangeTracking(
  options: UseAgentModeChangeTrackingOptions = {}
): UseAgentModeChangeTrackingReturn {
  const { onSessionChange } = options;

  // State
  const [currentSession, setCurrentSession] = useState<AgentModeSession | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Refs
  const trackerRef = useRef<AgentModeChangeTracker | null>(null);

  // Initialize tracker
  useEffect(() => {
    trackerRef.current = new AgentModeChangeTracker();

    // Add change listener
    const handleSessionChange = (session: AgentModeSession) => {
      setCurrentSession({ ...session });
      setCanUndo(trackerRef.current?.canUndo() || false);
      setCanRedo(trackerRef.current?.canRedo() || false);

      if (onSessionChange) {
        onSessionChange(session);
      }
    };

    trackerRef.current.addChangeListener(handleSessionChange);

    // Cleanup
    return () => {
      if (trackerRef.current) {
        trackerRef.current.removeChangeListener(handleSessionChange);
        trackerRef.current.clear();
      }
    };
  }, [onSessionChange]);

  // Start a new session
  const startSession = useCallback((originalContent: string): string => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const sessionId = trackerRef.current.startSession(originalContent);
    const session = trackerRef.current.getCurrentSession();
    if (session) {
      setCurrentSession({ ...session });
    }

    return sessionId;
  }, []);

  // Add a change to the current session
  const addChange = useCallback((change: Omit<TextChange, 'id' | 'timestamp'>) => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    trackerRef.current.addChange(change);
  }, []);

  // Complete the current session
  const completeSession = useCallback((modifiedContent: string) => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    trackerRef.current.completeSession(modifiedContent);
  }, []);

  // Apply all changes
  const applyAllChanges = useCallback((sessionId: string, currentContent: string): string => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const result = trackerRef.current.applyAllChanges(sessionId, currentContent);
    setCanUndo(trackerRef.current.canUndo());
    setCanRedo(trackerRef.current.canRedo());
    return result;
  }, []);

  // Apply specific changes
  const applyChanges = useCallback((sessionId: string, changeIds: string[], currentContent: string): string => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const result = trackerRef.current.applyChanges(sessionId, changeIds, currentContent);
    setCanUndo(trackerRef.current.canUndo());
    setCanRedo(trackerRef.current.canRedo());
    return result;
  }, []);

  // Revert all changes
  const revertAllChanges = useCallback((sessionId: string, currentContent: string): string => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const result = trackerRef.current.revertAllChanges(sessionId, currentContent);
    setCanUndo(trackerRef.current.canUndo());
    setCanRedo(trackerRef.current.canRedo());
    return result;
  }, []);

  // Revert specific changes
  const revertChanges = useCallback((sessionId: string, changeIds: string[], currentContent: string): string => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const result = trackerRef.current.revertChanges(sessionId, changeIds, currentContent);
    setCanUndo(trackerRef.current.canUndo());
    setCanRedo(trackerRef.current.canRedo());
    return result;
  }, []);

  // Undo last action
  const undo = useCallback((): string | null => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const result = trackerRef.current.undo();
    setCanUndo(trackerRef.current.canUndo());
    setCanRedo(trackerRef.current.canRedo());
    return result;
  }, []);

  // Redo last undone action
  const redo = useCallback((): string | null => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    const result = trackerRef.current.redo();
    setCanUndo(trackerRef.current.canUndo());
    setCanRedo(trackerRef.current.canRedo());
    return result;
  }, []);

  // Get changes summary
  const getChangesSummary = useCallback((sessionId: string): ChangesSummary => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    return trackerRef.current.getChangesSummary(sessionId);
  }, []);

  // Clear all sessions
  const clear = useCallback(() => {
    if (!trackerRef.current) {
      throw new Error('Tracker not initialized');
    }

    trackerRef.current.clear();
    setCurrentSession(null);
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return {
    currentSession,
    startSession,
    addChange,
    completeSession,
    applyAllChanges,
    applyChanges,
    revertAllChanges,
    revertChanges,
    undo,
    redo,
    canUndo,
    canRedo,
    getChangesSummary,
    clear
  };
}
