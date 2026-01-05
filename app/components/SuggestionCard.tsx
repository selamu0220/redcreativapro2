/**
 * Suggestion Card Component
 * 
 * Individual suggestion card with visual indicators and controls.
 * 
 * Requirements: 1.2, 1.4, 13.1
 */

"use client";

import { Suggestion } from "../lib/real-time-analysis-engine";
import { Check, X, Lightbulb, Sparkles, Search, MessageSquare } from "lucide-react";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
  isFirst?: boolean;
}

/**
 * Get visual styling for suggestion type
 */
function getSuggestionStyle(type: Suggestion['type']) {
  switch (type) {
    case 'grammar':
      return {
        icon: MessageSquare,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/10',
        borderColor: 'border-red-200 dark:border-red-800',
        label: 'Gramática'
      };
    case 'style':
      return {
        icon: Sparkles,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/10',
        borderColor: 'border-purple-200 dark:border-purple-800',
        label: 'Estilo'
      };
    case 'seo':
      return {
        icon: Search,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/10',
        borderColor: 'border-green-200 dark:border-green-800',
        label: 'SEO'
      };
    case 'clarity':
      return {
        icon: Lightbulb,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/10',
        borderColor: 'border-blue-200 dark:border-blue-800',
        label: 'Claridad'
      };
  }
}

/**
 * Suggestion Card Component
 * 
 * Displays a single suggestion with:
 * - Type-specific visual indicators
 * - Original and suggested text
 * - Explanation
 * - Confidence score
 * - Accept/reject buttons
 */
export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
  isFirst = false
}: SuggestionCardProps) {
  const style = getSuggestionStyle(suggestion.type);
  const Icon = style.icon;
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <div
      className={`
        suggestion-card
        rounded-lg border-2 p-4
        transition-all duration-200
        hover:shadow-md
        ${style.bgColor}
        ${style.borderColor}
        ${isFirst ? 'ring-2 ring-offset-2 ring-primary/20' : ''}
      `}
    >
      {/* Header with type indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${style.color}`} />
          <span className={`text-xs font-medium ${style.color}`}>
            {style.label}
          </span>
          {confidencePercent >= 80 && (
            <span className="text-xs text-muted-foreground">
              {confidencePercent}% confianza
            </span>
          )}
        </div>
        {isFirst && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
            Siguiente
          </span>
        )}
      </div>

      {/* Content comparison */}
      <div className="space-y-2 mb-3">
        {/* Original text */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Original:</div>
          <div className="text-sm bg-background/50 rounded px-3 py-2 line-through opacity-70">
            {suggestion.originalText}
          </div>
        </div>

        {/* Suggested text */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Sugerencia:</div>
          <div className="text-sm bg-background/50 rounded px-3 py-2 font-medium">
            {suggestion.suggestedText}
          </div>
        </div>
      </div>

      {/* Explanation */}
      {suggestion.explanation && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            {suggestion.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className={`
            flex-1 flex items-center justify-center gap-2
            px-4 py-2 rounded-md
            text-sm font-medium
            bg-primary text-primary-foreground
            hover:bg-primary/90
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          `}
          title="Aceptar sugerencia (Tab)"
        >
          <Check className="w-4 h-4" />
          Aceptar
        </button>
        <button
          onClick={onReject}
          className={`
            flex-1 flex items-center justify-center gap-2
            px-4 py-2 rounded-md
            text-sm font-medium
            bg-muted text-muted-foreground
            hover:bg-muted/80
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2
          `}
          title="Rechazar sugerencia (Esc)"
        >
          <X className="w-4 h-4" />
          Rechazar
        </button>
      </div>
    </div>
  );
}
