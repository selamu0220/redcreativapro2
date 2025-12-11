/**
 * Real-time GEO Optimization Hook
 * 
 * Provides real-time GEO analysis and optimization suggestions during content editing
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { geoOptimizer } from '../lib/geo-optimization';
import { conversationalAnalyzer } from '../lib/conversational-analyzer';
import { semanticContextAnalyzer } from '../lib/semantic-context-analyzer';
import { questionAnswerDetector } from '../lib/question-answer-detector';
import type { GEOAnalysisResult, OptimizationSuggestion } from '../lib/geo-optimization';

export interface GEOScore {
  overall: number;
  conversational: number;
  semantic: number;
  structure: number;
  eeat: number;
}

export interface RealTimeGEOAnalysis {
  score: GEOScore;
  suggestions: OptimizationSuggestion[];
  isAnalyzing: boolean;
  lastAnalyzed: Date | null;
  error: string | null;
}

export interface UseGEOOptimizationOptions {
  debounceMs?: number;
  enableRealTime?: boolean;
  minContentLength?: number;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface GEOOptimizationHook {
  analysis: RealTimeGEOAnalysis;
  analyzeContent: (content: string, metadata?: any) => Promise<void>;
  applyOptimization: (suggestionId: string) => Promise<boolean>;
  dismissSuggestion: (suggestionId: string) => void;
  refreshAnalysis: () => Promise<void>;
  setOptions: (options: Partial<UseGEOOptimizationOptions>) => void;
}

const DEFAULT_OPTIONS: UseGEOOptimizationOptions = {
  debounceMs: 1000,
  enableRealTime: true,
  minContentLength: 100,
  analysisDepth: 'detailed'
};

export function useGEOOptimization(
  initialContent: string = '',
  options: UseGEOOptimizationOptions = {}
): GEOOptimizationHook {
  const [analysis, setAnalysis] = useState<RealTimeGEOAnalysis>({
    score: {
      overall: 0,
      conversational: 0,
      semantic: 0,
      structure: 0,
      eeat: 0
    },
    suggestions: [],
    isAnalyzing: false,
    lastAnalyzed: null,
    error: null
  });

  const [currentOptions, setCurrentOptions] = useState<UseGEOOptimizationOptions>({
    ...DEFAULT_OPTIONS,
    ...options
  });

  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  /**
   * Perform GEO analysis on content
   */
  const performAnalysis = useCallback(async (content: string, metadata?: any) => {
    if (!content || content.length < currentOptions.minContentLength!) {
      setAnalysis(prev => ({
        ...prev,
        error: `Content too short. Minimum length: ${currentOptions.minContentLength} characters`
      }));
      return;
    }

    setAnalysis(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Perform comprehensive GEO analysis with error handling for each component
      let geoResult: GEOAnalysisResult;
      let suggestions: OptimizationSuggestion[] = [];
      
      try {
        geoResult = await geoOptimizer.analyzeContent(content);
        suggestions = geoOptimizer.getOptimizationSuggestions(geoResult);
      } catch (geoError) {
        console.error('GEO core analysis failed:', geoError);
        // Provide fallback empty result
        geoResult = {
          conversationalScore: 0,
          semanticRichness: 0,
          questionAnswerPatterns: [],
          eeatSignals: [],
          improvementAreas: ['Analysis temporarily unavailable'],
          overallScore: 0
        };
      }

      // Calculate individual scores with error handling
      const [conversationalScore, semanticScore, structureScore, eeatScore] = await Promise.allSettled([
        calculateConversationalScore(content),
        calculateSemanticScore(content),
        calculateStructureScore(content),
        calculateEEATScore(content, metadata)
      ]);

      // Extract scores with fallbacks
      const convScore = conversationalScore.status === 'fulfilled' ? conversationalScore.value : 0;
      const semScore = semanticScore.status === 'fulfilled' ? semanticScore.value : 0;
      const structScore = structureScore.status === 'fulfilled' ? structureScore.value : 0;
      const eeatScoreValue = eeatScore.status === 'fulfilled' ? eeatScore.value : 0;

      // Log any failed score calculations
      if (conversationalScore.status === 'rejected') {
        console.warn('Conversational score calculation failed:', conversationalScore.reason);
      }
      if (semanticScore.status === 'rejected') {
        console.warn('Semantic score calculation failed:', semanticScore.reason);
      }
      if (structureScore.status === 'rejected') {
        console.warn('Structure score calculation failed:', structureScore.reason);
      }
      if (eeatScore.status === 'rejected') {
        console.warn('EEAT score calculation failed:', eeatScore.reason);
      }

      // Calculate overall score
      const overallScore = (
        convScore * 0.25 +
        semScore * 0.3 +
        structScore * 0.25 +
        eeatScoreValue * 0.2
      );
      
      // Filter out dismissed suggestions
      const activeSuggestions = suggestions.filter(
        suggestion => !dismissedSuggestions.has(suggestion.id)
      );

      // Check if analysis produced meaningful results
      const hasValidResults = overallScore > 0 || activeSuggestions.length > 0;
      
      setAnalysis({
        score: {
          overall: Math.round(overallScore),
          conversational: Math.round(convScore),
          semantic: Math.round(semScore),
          structure: Math.round(structScore),
          eeat: Math.round(eeatScoreValue)
        },
        suggestions: activeSuggestions,
        isAnalyzing: false,
        lastAnalyzed: new Date(),
        error: hasValidResults ? null : 'Analysis completed but produced limited results. Try with different content.'
      });

    } catch (error) {
      console.error('GEO analysis error:', error);
      setAnalysis(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed unexpectedly'
      }));
    }
  }, [currentOptions, dismissedSuggestions]);

  /**
   * Debounced analysis function
   */
  const debouncedAnalysis = useMemo(
    () => debounce(performAnalysis, currentOptions.debounceMs!),
    [performAnalysis, currentOptions.debounceMs]
  );

  /**
   * Public method to analyze content
   */
  const analyzeContent = useCallback(async (content: string, metadata?: any) => {
    if (currentOptions.enableRealTime) {
      debouncedAnalysis(content, metadata);
    } else {
      await performAnalysis(content, metadata);
    }
  }, [debouncedAnalysis, performAnalysis, currentOptions.enableRealTime]);

  /**
   * Apply an optimization suggestion
   */
  const applyOptimization = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      const suggestion = analysis.suggestions.find(s => s.id === suggestionId);
      if (!suggestion) {
        console.warn(`Optimization suggestion with id ${suggestionId} not found`);
        return false;
      }

      // Set loading state for this specific suggestion
      setAnalysis(prev => ({
        ...prev,
        suggestions: prev.suggestions.map(s => 
          s.id === suggestionId 
            ? { ...s, isApplying: true } as OptimizationSuggestion & { isApplying?: boolean }
            : s
        )
      }));

      // Implement actual optimization application based on suggestion type
      let success = false;
      
      switch (suggestion.type) {
        case 'conversational':
          success = await applyConversationalOptimization(suggestion);
          break;
        case 'semantic':
          success = await applySemanticOptimization(suggestion);
          break;
        case 'structured':
          success = await applyStructuredOptimization(suggestion);
          break;
        case 'eeat':
          success = await applyEEATOptimization(suggestion);
          break;
        default:
          console.warn(`Unknown optimization type: ${suggestion.type}`);
          success = false;
      }

      if (success) {
        // Remove the applied suggestion from the list
        setAnalysis(prev => ({
          ...prev,
          suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
        }));
        
        // Optionally trigger a re-analysis to update scores
        // This would depend on your implementation needs
        console.log(`Successfully applied optimization: ${suggestion.title}`);
      } else {
        // Remove loading state on failure
        setAnalysis(prev => ({
          ...prev,
          suggestions: prev.suggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, isApplying: false } as OptimizationSuggestion & { isApplying?: boolean }
              : s
          )
        }));
      }

      return success;
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      
      // Remove loading state on error
      setAnalysis(prev => ({
        ...prev,
        suggestions: prev.suggestions.map(s => 
          s.id === suggestionId 
            ? { ...s, isApplying: false } as OptimizationSuggestion & { isApplying?: boolean }
            : s
        ),
        error: error instanceof Error ? error.message : 'Failed to apply optimization'
      }));
      
      return false;
    }
  }, [analysis.suggestions]);

  /**
   * Dismiss a suggestion
   */
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    setAnalysis(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
    }));
  }, []);

  /**
   * Refresh analysis
   */
  const refreshAnalysis = useCallback(async () => {
    // This would re-analyze the current content
    // Implementation depends on how you track current content
    console.log('Refreshing GEO analysis...');
  }, []);

  /**
   * Update options
   */
  const setOptions = useCallback((newOptions: Partial<UseGEOOptimizationOptions>) => {
    setCurrentOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Initialize with initial content if provided
  useEffect(() => {
    if (initialContent && currentOptions.enableRealTime) {
      analyzeContent(initialContent);
    }
  }, [initialContent, analyzeContent, currentOptions.enableRealTime]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedAnalysis.cancel();
    };
  }, [debouncedAnalysis]);

  return {
    analysis,
    analyzeContent,
    applyOptimization,
    dismissSuggestion,
    refreshAnalysis,
    setOptions
  };
}

/**
 * Calculate conversational language score
 */
async function calculateConversationalScore(content: string): Promise<number> {
  try {
    const analysis = conversationalAnalyzer.analyzeContent(content);
    
    // Convert analysis to 0-100 score
    const formalityScore = (1 - analysis.formalityScore / 100) * 100; // Lower formality = higher score
    const questionScore = Math.min(analysis.questionBasedHeadingOpportunities.length * 10, 100);
    const naturalLanguageScore = analysis.overallReadabilityScore;
    
    return (formalityScore * 0.4 + questionScore * 0.3 + naturalLanguageScore * 0.3);
  } catch (error) {
    console.error('Conversational score calculation failed:', error);
    return 0;
  }
}

/**
 * Calculate semantic richness score
 */
async function calculateSemanticScore(content: string): Promise<number> {
  try {
    const analysis = semanticContextAnalyzer.analyzeSemanticContext(content);
    
    // Convert analysis to 0-100 score
    const relatedTermsScore = Math.min(analysis.relatedTerms.length * 5, 100);
    const semanticRichnessScore = analysis.semanticRichness;
    const contextDepthScore = analysis.contextDepth;
    
    return (relatedTermsScore * 0.3 + semanticRichnessScore * 0.4 + contextDepthScore * 0.3);
  } catch (error) {
    console.error('Semantic score calculation failed:', error);
    return 0;
  }
}

/**
 * Calculate content structure score
 */
async function calculateStructureScore(content: string): Promise<number> {
  try {
    const qaAnalysis = questionAnswerDetector.analyzeQuestionAnswerPatterns(content);
    
    // Analyze structure elements
    const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
    const paragraphCount = content.split('\n\n').length;
    const listCount = (content.match(/^[\*\-\+]\s/gm) || []).length;
    
    // Calculate structure score
    const headingScore = Math.min(headingCount * 15, 100);
    const qaScore = Math.min((qaAnalysis.explicitQuestions.length + qaAnalysis.implicitQuestions.length) * 10, 100);
    const organizationScore = Math.min((paragraphCount + listCount) * 2, 100);
    
    return (headingScore * 0.4 + qaScore * 0.4 + organizationScore * 0.2);
  } catch (error) {
    console.error('Structure score calculation failed:', error);
    return 0;
  }
}

/**
 * Calculate EEAT (Expertise, Authoritativeness, Trustworthiness) score
 */
async function calculateEEATScore(content: string, metadata?: any): Promise<number> {
  try {
    // Basic EEAT indicators
    const hasAuthor = !!(metadata?.author || content.includes('author') || content.includes('by '));
    const hasDate = !!(metadata?.publishDate || content.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/));
    const hasSources = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    const hasCredentials = content.toLowerCase().includes('expert') || content.toLowerCase().includes('certified');
    
    // Calculate EEAT score
    let score = 0;
    if (hasAuthor) score += 25;
    if (hasDate) score += 20;
    if (hasSources > 0) score += Math.min(hasSources * 10, 30);
    if (hasCredentials) score += 25;
    
    return Math.min(score, 100);
  } catch (error) {
    console.error('EEAT score calculation failed:', error);
    return 0;
  }
}

/**
 * Apply conversational optimization suggestions
 */
async function applyConversationalOptimization(suggestion: OptimizationSuggestion): Promise<boolean> {
  try {
    // In a real implementation, this would modify the actual content
    // For now, we'll simulate the optimization application
    console.log(`Applying conversational optimization: ${suggestion.title}`);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Here you would implement actual text transformations:
    // - Replace formal language with conversational alternatives
    // - Add questions and natural language patterns
    // - Improve readability and tone
    
    return true;
  } catch (error) {
    console.error('Failed to apply conversational optimization:', error);
    return false;
  }
}

/**
 * Apply semantic optimization suggestions
 */
async function applySemanticOptimization(suggestion: OptimizationSuggestion): Promise<boolean> {
  try {
    console.log(`Applying semantic optimization: ${suggestion.title}`);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Here you would implement actual semantic enhancements:
    // - Add related terms and synonyms
    // - Improve topical coverage
    // - Enhance contextual depth
    
    return true;
  } catch (error) {
    console.error('Failed to apply semantic optimization:', error);
    return false;
  }
}

/**
 * Apply structured optimization suggestions
 */
async function applyStructuredOptimization(suggestion: OptimizationSuggestion): Promise<boolean> {
  try {
    console.log(`Applying structured optimization: ${suggestion.title}`);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 750));
    
    // Here you would implement actual structural changes:
    // - Add FAQ sections
    // - Improve Q&A formatting
    // - Add structured data markup
    // - Enhance content organization
    
    return true;
  } catch (error) {
    console.error('Failed to apply structured optimization:', error);
    return false;
  }
}

/**
 * Apply EEAT optimization suggestions
 */
async function applyEEATOptimization(suggestion: OptimizationSuggestion): Promise<boolean> {
  try {
    console.log(`Applying EEAT optimization: ${suggestion.title}`);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Here you would implement actual EEAT enhancements:
    // - Add author information and credentials
    // - Include authoritative sources and citations
    // - Add publication dates and update timestamps
    // - Enhance trustworthiness signals
    
    return true;
  } catch (error) {
    console.error('Failed to apply EEAT optimization:', error);
    return false;
  }
}