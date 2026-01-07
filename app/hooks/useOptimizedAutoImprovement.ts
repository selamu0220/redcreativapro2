"use client";

import { useCallback, useRef, useEffect, useState } from 'react';
import { useMemoryManager } from '../lib/performance/MemoryManager';

export interface AutoImprovementConfig {
  enabled: boolean;
  delay: number; // milliseconds
  minWords: number;
  maxRetries: number;
  debounceDelay: number;
  improvementLevel: 'conservative' | 'balanced' | 'creative';
}

export interface AutoImprovementState {
  isTyping: boolean;
  isPaused: boolean;
  isImproving: boolean;
  lastImprovement: number;
  improvementCount: number;
}

interface UseOptimizedAutoImprovementProps {
  config: AutoImprovementConfig;
  onImprove: (content: string, isAuto: boolean) => Promise<void>;
  getCurrentContent: () => string;
  enabled?: boolean;
}

export function useOptimizedAutoImprovement({
  config,
  onImprove,
  getCurrentContent,
  enabled = true
}: UseOptimizedAutoImprovementProps) {
  const memoryManager = useMemoryManager();
  
  // State management
  const [state, setState] = useState<AutoImprovementState>({
    isTyping: false,
    isPaused: false,
    isImproving: false,
    lastImprovement: 0,
    improvementCount: 0
  });

  // Refs for timeout management
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const improvementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (improvementTimeoutRef.current) {
      clearTimeout(improvementTimeoutRef.current);
      improvementTimeoutRef.current = null;
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  // Register cleanup with memory manager
  useEffect(() => {
    memoryManager.registerListener('auto-improvement-cleanup', cleanup);
    return cleanup;
  }, [cleanup, memoryManager]);

  // Safe timeout setter with memory management
  const setSafeTimeout = useCallback((
    callback: () => void,
    delay: number,
    ref: React.MutableRefObject<NodeJS.Timeout | null>,
    context: string
  ) => {
    // Clear existing timeout
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      callback();
      ref.current = null; // Auto-cleanup
    }, delay);

    ref.current = timeout;
    memoryManager.registerTimeout(timeout, context);
    
    return timeout;
  }, [memoryManager]);

  // Get current word count
  const getWordCount = useCallback(() => {
    const content = getCurrentContent();
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [getCurrentContent]);

  // Check if content meets minimum word count
  const meetsMinimumWords = useCallback(() => {
    const wordCount = getWordCount();
    return wordCount >= config.minWords;
  }, [getWordCount, config.minWords]);

  // Optimized typing detection
  const handleTyping = useCallback(() => {
    if (!enabled || !config.enabled) return;

    // Update typing state immediately
    setState(prev => ({ ...prev, isTyping: true }));

    // Clear existing typing timeout
    setSafeTimeout(
      () => {
        setState(prev => ({ ...prev, isTyping: false }));
        
        // Check if we should trigger auto-improvement
        const content = getCurrentContent();
        const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        
        // Skip auto-improvement if content is below minimum word threshold
        if (wordCount < config.minWords) {
          console.log(`[useOptimizedAutoImprovement] Content too short (${wordCount} words, minimum ${config.minWords}). Skipping auto-improvement.`);
          return;
        }
        
        if (!state.isImproving && !state.isPaused) {
          // Schedule improvement with debouncing
          setSafeTimeout(
            () => {
              setState(prev => ({ ...prev, isImproving: true }));
              
              const startTime = Date.now();
              onImprove(content, true)
                .then(() => {
                  const endTime = Date.now();
                  setState(prev => ({
                    ...prev,
                    isImproving: false,
                    lastImprovement: endTime,
                    improvementCount: prev.improvementCount + 1,
                    lastLatency: endTime - startTime
                  }));
                })
                .catch((error) => {
                  console.error('Auto-improvement failed:', error);
                  setState(prev => ({ ...prev, isImproving: false }));
                });
            },
            config.delay,
            improvementTimeoutRef,
            'auto-improvement'
          );
        }
      },
      config.debounceDelay,
      typingTimeoutRef,
      'typing-detection'
    );
  }, [enabled, config, getCurrentContent, onImprove, state.isImproving, state.isPaused, setSafeTimeout]);

  // Pause auto-improvement temporarily
  const pauseAutoImprovement = useCallback((duration: number = 5000) => {
    setState(prev => ({ ...prev, isPaused: true }));
    
    // Clear any pending improvement
    if (improvementTimeoutRef.current) {
      clearTimeout(improvementTimeoutRef.current);
      improvementTimeoutRef.current = null;
    }

    // Resume after duration
    setSafeTimeout(
      () => {
        setState(prev => ({ ...prev, isPaused: false }));
      },
      duration,
      pauseTimeoutRef,
      'pause-resume'
    );
  }, [setSafeTimeout]);

  // Resume auto-improvement immediately
  const resumeAutoImprovement = useCallback(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Force improvement (manual trigger)
  const forceImprovement = useCallback(async () => {
    if (state.isImproving) return;

    const content = getCurrentContent();
    if (!content.trim()) return;

    setState(prev => ({ ...prev, isImproving: true }));
    
    try {
      await onImprove(content, false);
      setState(prev => ({
        ...prev,
        isImproving: false,
        lastImprovement: Date.now(),
        improvementCount: prev.improvementCount + 1
      }));
    } catch (error) {
      console.error('Manual improvement failed:', error);
      setState(prev => ({ ...prev, isImproving: false }));
      throw error;
    }
  }, [state.isImproving, getCurrentContent, onImprove]);

  // Reset state
  const resetState = useCallback(() => {
    cleanup();
    setState({
      isTyping: false,
      isPaused: false,
      isImproving: false,
      lastImprovement: 0,
      improvementCount: 0
    });
  }, [cleanup]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const memoryMetrics = memoryManager.getMemoryMetrics();
    const audit = memoryManager.performMemoryAudit();
    
    return {
      memoryUsage: memoryMetrics?.memoryUsagePercentage || 0,
      activeTimeouts: audit.activeTimeouts,
      improvementCount: state.improvementCount,
      lastImprovement: state.lastImprovement,
      isOptimized: audit.activeTimeouts <= 5 && (memoryMetrics?.memoryUsagePercentage || 0) < 0.7
    };
  }, [memoryManager, state]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    state,
    
    // Actions
    handleTyping,
    pauseAutoImprovement,
    resumeAutoImprovement,
    forceImprovement,
    resetState,
    
    // Utilities
    cleanup,
    getPerformanceMetrics,
    getWordCount,
    meetsMinimumWords,
    
    // Computed values
    canImprove: !state.isImproving && !state.isPaused && enabled && config.enabled,
    timeSinceLastImprovement: Date.now() - state.lastImprovement
  };
}

// Hook for managing auto-improvement configuration
export function useAutoImprovementConfig(initialConfig?: Partial<AutoImprovementConfig>) {
  const [config, setConfig] = useState<AutoImprovementConfig>({
    enabled: true,
    delay: 2000, // 2 seconds
    minWords: 5,
    maxRetries: 3,
    debounceDelay: 1000, // 1 second
    ...initialConfig
  });

  const updateConfig = useCallback((updates: Partial<AutoImprovementConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      enabled: true,
      delay: 2000,
      minWords: 5,
      maxRetries: 3,
      debounceDelay: 1000
    });
  }, []);

  return {
    config,
    updateConfig,
    resetConfig
  };
}