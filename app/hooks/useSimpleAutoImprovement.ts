"use client";

import { useCallback, useRef, useEffect, useState } from 'react';

export interface AutoImprovementConfig {
  enabled: boolean;
  delay: number; // milliseconds
  minWords: number;
  improvementLevel: 'conservative' | 'balanced' | 'creative';
}

export interface AutoImprovementState {
  isTyping: boolean;
  isImproving: boolean;
  lastImprovement: number;
  improvementCount: number;
  lastError: string | null;
  errorCount: number;
}

interface UseSimpleAutoImprovementProps {
  config: AutoImprovementConfig;
  onImprove: (content: string, isAuto: boolean) => Promise<void>;
  getCurrentContent: () => string;
  enabled?: boolean;
}

export function useSimpleAutoImprovement({
  config,
  onImprove,
  getCurrentContent,
  enabled = true
}: UseSimpleAutoImprovementProps) {
  
  // State management
  const [state, setState] = useState<AutoImprovementState>({
    isTyping: false,
    isImproving: false,
    lastImprovement: 0,
    improvementCount: 0,
    lastError: null,
    errorCount: 0
  });

  // Refs for timeout management
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const improvementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, []);

  // Get current word count
  const getWordCount = useCallback(() => {
    const content = getCurrentContent();
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [getCurrentContent]);

  // Handle typing detection
  const handleTyping = useCallback(() => {
    if (!enabled || !config.enabled || state.isImproving) {
      console.log('[SimpleAutoImprovement] Typing ignored:', {
        enabled,
        configEnabled: config.enabled,
        isImproving: state.isImproving
      });
      return;
    }

    console.log('[SimpleAutoImprovement] Typing detected');

    // Update typing state immediately
    setState(prev => ({ ...prev, isTyping: true }));

    // Clear existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (improvementTimeoutRef.current) {
      clearTimeout(improvementTimeoutRef.current);
    }

    // Set typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isTyping: false }));
      
      // Check if we should trigger auto-improvement
      const content = getCurrentContent();
      const wordCount = getWordCount();
      
      console.log('[SimpleAutoImprovement] Stopped typing, word count:', wordCount);
      
      // Skip auto-improvement if content is below minimum word threshold
      if (wordCount < config.minWords) {
        const errorMsg = `Contenido muy corto (${wordCount} palabras, mínimo ${config.minWords})`;
        console.log(`[SimpleAutoImprovement] ${errorMsg}`);
        setState(prev => ({ ...prev, lastError: errorMsg }));
        return;
      }
      
      if (!state.isImproving) {
        console.log('[SimpleAutoImprovement] Scheduling improvement...');
        
        // Schedule improvement
        improvementTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, isImproving: true, lastError: null }));
          
          console.log('[SimpleAutoImprovement] Starting improvement...');
          
          onImprove(content, true)
            .then(() => {
              console.log('[SimpleAutoImprovement] Improvement completed successfully');
              setState(prev => ({
                ...prev,
                isImproving: false,
                lastImprovement: Date.now(),
                improvementCount: prev.improvementCount + 1,
                lastError: null,
                errorCount: 0
              }));
            })
            .catch((error) => {
              console.error('[SimpleAutoImprovement] Improvement failed:', error);
              const errorMsg = error?.message || 'Error desconocido en mejoramiento automático';
              setState(prev => ({ 
                ...prev, 
                isImproving: false,
                lastError: errorMsg,
                errorCount: prev.errorCount + 1
              }));
            });
        }, config.delay);
      }
    }, 1500); // 1.5 seconds after stopping typing
  }, [enabled, config, getCurrentContent, onImprove, state.isImproving, getWordCount]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, lastError: null, errorCount: 0 }));
  }, []);

  return {
    state,
    handleTyping,
    cleanup,
    clearError,
    getWordCount,
    canImprove: !state.isImproving && enabled && config.enabled
  };
}