/**
 * Suggestion Display Component
 * 
 * Displays inline AI suggestions with accept/reject controls.
 * Implements suggestion queuing to prevent overwhelming users.
 * 
 * Requirements: 1.2, 1.4, 13.1
 */

"use client";

import { useState, useEffect } from "react";
import { Suggestion } from "../lib/real-time-analysis-engine";
import { SuggestionCard } from "./SuggestionCard";
import { SuggestionQueue } from "../lib/suggestion-queue";

interface SuggestionDisplayProps {
  suggestions: Suggestion[];
  onAccept: (suggestion: Suggestion) => void;
  onReject: (suggestion: Suggestion) => void;
  maxVisible?: number; // Maximum suggestions to show at once
  className?: string;
}

/**
 * Suggestion Display Component
 * 
 * Manages the display of AI suggestions with:
 * - Queuing to prevent overwhelming users
 * - Visual indicators for different suggestion types
 * - Accept/reject controls
 * - Keyboard shortcuts (Tab/Esc)
 */
export function SuggestionDisplay({
  suggestions,
  onAccept,
  onReject,
  maxVisible = 3,
  className = ""
}: SuggestionDisplayProps) {
  const [queue] = useState(() => new SuggestionQueue(maxVisible));
  const [visibleSuggestions, setVisibleSuggestions] = useState<Suggestion[]>([]);

  // Update queue when suggestions change
  useEffect(() => {
    queue.addSuggestions(suggestions);
    setVisibleSuggestions(queue.getVisible());
  }, [suggestions, queue]);

  // Handle accept action
  const handleAccept = (suggestion: Suggestion) => {
    queue.remove(suggestion.id);
    setVisibleSuggestions(queue.getVisible());
    onAccept(suggestion);
  };

  // Handle reject action
  const handleReject = (suggestion: Suggestion) => {
    queue.remove(suggestion.id);
    setVisibleSuggestions(queue.getVisible());
    onReject(suggestion);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if there are visible suggestions
      if (visibleSuggestions.length === 0) return;

      // Tab key - accept first suggestion
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleAccept(visibleSuggestions[0]);
      }

      // Esc key - reject first suggestion
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReject(visibleSuggestions[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleSuggestions]);

  // Don't render if no suggestions
  if (visibleSuggestions.length === 0) {
    return null;
  }

  const queuedCount = queue.getQueuedCount();

  return (
    <div className={`suggestion-display ${className}`}>
      {/* Header with queue info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Sugerencias de IA
          </span>
          <span className="text-xs text-muted-foreground">
            {visibleSuggestions.length} visible{queuedCount > 0 ? `, ${queuedCount} en cola` : ''}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Tab</kbd> aceptar
          {' · '}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> rechazar
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => handleAccept(suggestion)}
            onReject={() => handleReject(suggestion)}
            isFirst={index === 0}
          />
        ))}
      </div>

      {/* Queue indicator */}
      {queuedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {queuedCount} sugerencia{queuedCount !== 1 ? 's' : ''} más en cola
          </p>
        </div>
      )}
    </div>
  );
}
