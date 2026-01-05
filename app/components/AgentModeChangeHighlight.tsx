/**
 * Agent Mode Change Highlight Component
 * 
 * Displays visual highlights for changes made by agent mode directly in the editor.
 * Shows inline indicators for additions, deletions, and modifications.
 * 
 * Requirements: 2.3
 */

"use client";

import { TextChange } from '../lib/agent-mode-change-tracking';

interface AgentModeChangeHighlightProps {
  content: string;
  changes: TextChange[];
  appliedChanges: Set<string>;
  revertedChanges: Set<string>;
  onChangeClick?: (change: TextChange) => void;
  className?: string;
}

/**
 * Agent Mode Change Highlight Component
 * 
 * Renders content with visual highlights showing where changes were made.
 * Different colors indicate different types of changes.
 */
export function AgentModeChangeHighlight({
  content,
  changes,
  appliedChanges,
  revertedChanges,
  onChangeClick,
  className = ''
}: AgentModeChangeHighlightProps) {
  // Sort changes by position (start to end)
  const sortedChanges = [...changes].sort((a, b) => a.position.start - b.position.start);

  // Build segments with highlights
  const segments: Array<{
    text: string;
    change?: TextChange;
    isApplied?: boolean;
    isReverted?: boolean;
  }> = [];

  let lastPosition = 0;

  for (const change of sortedChanges) {
    // Add text before this change
    if (change.position.start > lastPosition) {
      segments.push({
        text: content.substring(lastPosition, change.position.start)
      });
    }

    // Add the change segment
    const isApplied = appliedChanges.has(change.id);
    const isReverted = revertedChanges.has(change.id);

    segments.push({
      text: isApplied ? change.after : change.before,
      change,
      isApplied,
      isReverted
    });

    lastPosition = change.position.end;
  }

  // Add remaining text
  if (lastPosition < content.length) {
    segments.push({
      text: content.substring(lastPosition)
    });
  }

  // Get highlight color based on change type and status
  const getHighlightClass = (
    change: TextChange,
    isApplied: boolean,
    isReverted: boolean
  ): string => {
    if (isReverted) {
      return 'bg-red-100 text-red-900 line-through';
    }

    if (isApplied) {
      return 'bg-green-100 text-green-900';
    }

    // Pending changes - color by type
    switch (change.type) {
      case 'structural':
        return 'bg-purple-100 text-purple-900 border-b-2 border-purple-400';
      case 'stylistic':
        return 'bg-blue-100 text-blue-900 border-b-2 border-blue-400';
      case 'seo':
        return 'bg-green-100 text-green-900 border-b-2 border-green-400';
      case 'clarity':
        return 'bg-yellow-100 text-yellow-900 border-b-2 border-yellow-400';
      case 'grammar':
        return 'bg-red-100 text-red-900 border-b-2 border-red-400';
      default:
        return 'bg-gray-100 text-gray-900 border-b-2 border-gray-400';
    }
  };

  return (
    <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${className}`}>
      {segments.map((segment, index) => {
        if (segment.change) {
          const highlightClass = getHighlightClass(
            segment.change,
            segment.isApplied || false,
            segment.isReverted || false
          );

          return (
            <span
              key={index}
              className={`${highlightClass} cursor-pointer hover:opacity-80 transition-opacity px-1 rounded`}
              onClick={() => onChangeClick && onChangeClick(segment.change!)}
              title={segment.change.reason}
            >
              {segment.text}
            </span>
          );
        }

        return <span key={index}>{segment.text}</span>;
      })}
    </div>
  );
}

/**
 * Change Highlight Legend Component
 * 
 * Shows a legend explaining the different highlight colors
 */
export function AgentModeChangeHighlightLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 text-xs ${className}`}>
      <span className="font-medium text-gray-700">Leyenda:</span>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-purple-100 text-purple-900 border-b-2 border-purple-400 rounded">
          Estructural
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-blue-100 text-blue-900 border-b-2 border-blue-400 rounded">
          Estilo
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-green-100 text-green-900 border-b-2 border-green-400 rounded">
          SEO
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-yellow-100 text-yellow-900 border-b-2 border-yellow-400 rounded">
          Claridad
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-red-100 text-red-900 border-b-2 border-red-400 rounded">
          Gramática
        </span>
      </div>
      <span className="text-gray-400">|</span>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-green-100 text-green-900 rounded">
          Aplicado
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-1 bg-red-100 text-red-900 line-through rounded">
          Revertido
        </span>
      </div>
    </div>
  );
}
