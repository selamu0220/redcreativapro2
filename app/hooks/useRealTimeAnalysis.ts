/**
 * React Hook for Real-Time Analysis Engine
 * 
 * Provides a React-friendly interface to the Real-Time Analysis Engine
 * with automatic lifecycle management and state updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  RealTimeAnalysisEngine,
  AnalysisConfig,
  AnalysisResult,
  Suggestion
} from '../lib/real-time-analysis-engine';

export interface UseRealTimeAnalysisOptions {
  enabled?: boolean;
  interval?: number;
  debounceDelay?: number;
  minContentLength?: number;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
}

export interface UseRealTimeAnalysisReturn {
  suggestions: Suggestion[];
  isAnalyzing: boolean;
  lastAnalysisTime: number | null;
  timeSinceLastAnalysis: number;
  updateContent: (content: string) => void;
  forceAnalysis: (content: string) => Promise<AnalysisResult>;
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
  processingTime: number | null;
}

/**
 * Hook for integrating real-time analysis into React components
 * 
 * @param options - Configuration options
 * @returns Analysis state and control functions
 */
export function useRealTimeAnalysis(
  options: UseRealTimeAnalysisOptions = {}
): UseRealTimeAnalysisReturn {
  const {
    enabled = true,
    interval = 2000,
    debounceDelay = 300,
    minContentLength = 10,
    onAnalysisComplete,
    onError
  } = options;

  // State
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number | null>(null);
  const [timeSinceLastAnalysis, setTimeSinceLastAnalysis] = useState(Infinity);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  // Refs
  const engineRef = useRef<RealTimeAnalysisEngine | null>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize engine
  useEffect(() => {
    const config: Partial<AnalysisConfig> = {
      interval,
      debounceDelay,
      minContentLength,
      enabled: isEnabled
    };

    engineRef.current = new RealTimeAnalysisEngine(config);

    // Start engine with callbacks
    const handleAnalysisComplete = (result: AnalysisResult) => {
      setSuggestions(result.suggestions);
      setLastAnalysisTime(result.timestamp);
      setProcessingTime(result.processingTime);
      setIsAnalyzing(false);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    };

    const handleError = (error: Error) => {
      console.error('Real-time analysis error:', error);
      setIsAnalyzing(false);

      if (onError) {
        onError(error);
      }
    };

    if (isEnabled) {
      engineRef.current.start(handleAnalysisComplete, handleError);
    }

    // Update timer for time since last analysis
    updateTimerRef.current = setInterval(() => {
      if (engineRef.current) {
        setTimeSinceLastAnalysis(engineRef.current.getTimeSinceLastAnalysis());
        setIsAnalyzing(engineRef.current.isProcessing());
      }
    }, 100); // Update every 100ms for smooth UI

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [interval, debounceDelay, minContentLength, isEnabled, onAnalysisComplete, onError]);

  // Update content
  const updateContent = useCallback((content: string) => {
    if (engineRef.current) {
      engineRef.current.updateContent(content);
    }
  }, []);

  // Force analysis
  const forceAnalysis = useCallback(async (content: string): Promise<AnalysisResult> => {
    if (!engineRef.current) {
      throw new Error('Analysis engine not initialized');
    }

    setIsAnalyzing(true);
    try {
      const result = await engineRef.current.forceAnalysis(content);
      setSuggestions(result.suggestions);
      setLastAnalysisTime(result.timestamp);
      setProcessingTime(result.processingTime);
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Enable/disable engine
  const handleSetEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (engineRef.current) {
      engineRef.current.updateConfig({ enabled });
    }
  }, []);

  return {
    suggestions,
    isAnalyzing,
    lastAnalysisTime,
    timeSinceLastAnalysis,
    updateContent,
    forceAnalysis,
    setEnabled: handleSetEnabled,
    isEnabled,
    processingTime
  };
}
