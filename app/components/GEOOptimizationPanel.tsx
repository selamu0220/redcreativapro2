'use client';

/**
 * GEO Optimization Panel Component
 * 
 * Displays real-time GEO analysis and optimization suggestions
 */

import React, { useState } from 'react';
import { useGEOOptimization, type GEOScore, type RealTimeGEOAnalysis } from '../../hooks/useGEOOptimization';
import type { OptimizationSuggestion } from '../../lib/geo-optimization';
import { GEOErrorBoundary, useGEOErrorReporting } from './GEOErrorBoundary';


interface GEOOptimizationPanelProps {
  content: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

function GEOOptimizationPanelContent({ 
  content, 
  onContentChange,
  className = '' 
}: GEOOptimizationPanelProps) {
  const { analysis, analyzeContent, applyOptimization, dismissSuggestion } = useGEOOptimization(content);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const { reportError } = useGEOErrorReporting();

  React.useEffect(() => {
    if (content) {
      analyzeContent(content).catch(error => {
        reportError(error, 'GEOOptimizationPanel.analyzeContent');
      });
    }
  }, [content, analyzeContent, reportError]);

  return (
    <div className={`geo-optimization-panel bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">GEO Optimization</h3>
        <p className="text-sm text-gray-600 mt-1">
          Real-time analysis for Generative Engine Optimization
        </p>
      </div>

      {/* Loading State */}
      {analysis.isAnalyzing && (
        <div className="p-4 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Analyzing content...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {analysis.error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{analysis.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Score Dashboard */}
      {!analysis.isAnalyzing && !analysis.error && (
        <>
          <ScoreSection score={analysis.score} />
          
          {/* Suggestions */}
          <SuggestionsSection 
            suggestions={analysis.suggestions}
            expandedSuggestion={expandedSuggestion}
            onExpandSuggestion={setExpandedSuggestion}
            onApplySuggestion={applyOptimization}
            onDismissSuggestion={dismissSuggestion}
          />

          {/* Last Analyzed */}
          {analysis.lastAnalyzed && (
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
              Last analyzed: {analysis.lastAnalyzed.toLocaleTimeString()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface ScoreSectionProps {
  score: GEOScore;
}

function ScoreSection({ score }: ScoreSectionProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall GEO Score</span>
          <span className="text-lg font-bold text-gray-900">{score.overall}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(score.overall)}`}
            style={{ width: `${score.overall}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <ScoreItem label="Conversational" score={score.conversational} />
        <ScoreItem label="Semantic" score={score.semantic} />
        <ScoreItem label="Structure" score={score.structure} />
        <ScoreItem label="E-E-A-T" score={score.eeat} />
      </div>
    </div>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
}

function ScoreItem({ label, score }: ScoreItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center">
        <span className="text-gray-900 font-medium mr-2">{score}</span>
        <div className="w-8 bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 rounded-full ${getScoreColor(score)}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

interface SuggestionsSectionProps {
  suggestions: OptimizationSuggestion[];
  expandedSuggestion: string | null;
  onExpandSuggestion: (id: string | null) => void;
  onApplySuggestion: (id: string) => Promise<boolean>;
  onDismissSuggestion: (id: string) => void;
}

function SuggestionsSection({ 
  suggestions, 
  expandedSuggestion, 
  onExpandSuggestion,
  onApplySuggestion,
  onDismissSuggestion 
}: SuggestionsSectionProps) {
  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">No optimization suggestions at this time.</p>
        <p className="text-xs mt-1">Your content is well-optimized for GEO!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Optimization Suggestions ({suggestions.length})
        </h4>
        
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isExpanded={expandedSuggestion === suggestion.id}
              onExpand={() => onExpandSuggestion(
                expandedSuggestion === suggestion.id ? null : suggestion.id
              )}
              onApply={() => onApplySuggestion(suggestion.id)}
              onDismiss={() => onDismissSuggestion(suggestion.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: OptimizationSuggestion;
  isExpanded: boolean;
  onExpand: () => void;
  onApply: () => void;
  onDismiss: () => void;
}

function SuggestionCard({ 
  suggestion, 
  isExpanded, 
  onExpand, 
  onApply, 
  onDismiss 
}: SuggestionCardProps) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PriorityBadge priority={suggestion.priority} />
            <TypeBadge type={suggestion.type} />
          </div>
          
          <h5 className="text-sm font-medium text-gray-900 mb-1">
            {suggestion.title}
          </h5>
          
          <p className="text-xs text-gray-600 line-clamp-2">
            {suggestion.description}
          </p>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-700">Implementation:</span>
                <p className="text-xs text-gray-600 mt-1">{suggestion.implementation}</p>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Impact: {Math.round(suggestion.expectedImpact * 100)}%</span>
                <span>Effort: {suggestion.effort}</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onExpand}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
          
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-gray-600 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[priority]}`}>
      {priority}
    </span>
  );
}

interface TypeBadgeProps {
  type: 'conversational' | 'semantic' | 'structured' | 'eeat' | 'content' | 'structure' | 'schema' | 'technical';
}

function TypeBadge({ type }: TypeBadgeProps) {
  const colors = {
    conversational: 'bg-blue-100 text-blue-800',
    semantic: 'bg-green-100 text-green-800',
    structured: 'bg-purple-100 text-purple-800',
    eeat: 'bg-orange-100 text-orange-800',
    content: 'bg-blue-100 text-blue-800',
    structure: 'bg-green-100 text-green-800',
    schema: 'bg-purple-100 text-purple-800',
    technical: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[type]}`}>
      {type}
    </span>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}
// Export the component wrapped with error boundary
export default function GEOOptimizationPanel(props: GEOOptimizationPanelProps) {
  return (
    <GEOErrorBoundary
      fallback={
        <div className="geo-optimization-panel bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">GEO Analysis Unavailable</h3>
            <p className="text-sm text-gray-600">
              The GEO optimization panel encountered an error. Please try refreshing the page.
            </p>
          </div>
        </div>
      }
    >
      <GEOOptimizationPanelContent {...props} />
    </GEOErrorBoundary>
  );
}