/**
 * Suggestion Display Demo Component
 * 
 * Demonstrates the suggestion display system with mock data.
 * Useful for testing and showcasing the feature.
 * 
 * Requirements: 1.2, 1.4, 13.1
 */

"use client";

import { useState } from "react";
import { SuggestionDisplay } from "./SuggestionDisplay";
import { Suggestion } from "../lib/real-time-analysis-engine";

// Mock suggestions for demonstration
const demoSuggestions: Suggestion[] = [
  {
    id: 'demo-1',
    type: 'grammar',
    originalText: 'Their going to the store',
    suggestedText: "They're going to the store",
    explanation: 'Incorrect use of "their" instead of "they\'re" (contraction of "they are")',
    confidence: 0.95,
    position: { start: 0, end: 24 }
  },
  {
    id: 'demo-2',
    type: 'clarity',
    originalText: 'It is important to note that the implementation of this feature',
    suggestedText: 'This feature',
    explanation: 'Remove unnecessary filler phrase for clearer, more direct writing',
    confidence: 0.85,
    position: { start: 50, end: 113 }
  },
  {
    id: 'demo-3',
    type: 'style',
    originalText: 'very good',
    suggestedText: 'excellent',
    explanation: 'More impactful and professional word choice',
    confidence: 0.75,
    position: { start: 150, end: 159 }
  },
  {
    id: 'demo-4',
    type: 'seo',
    originalText: 'writing tips',
    suggestedText: 'AI writing tips for journalists',
    explanation: 'Include target keywords for better SEO ranking',
    confidence: 0.80,
    position: { start: 200, end: 212 }
  },
  {
    id: 'demo-5',
    type: 'grammar',
    originalText: 'The data shows that',
    suggestedText: 'The data show that',
    explanation: '"Data" is plural, so it should be "show" not "shows"',
    confidence: 0.90,
    position: { start: 250, end: 269 }
  },
  {
    id: 'demo-6',
    type: 'style',
    originalText: 'in order to',
    suggestedText: 'to',
    explanation: 'Simplify phrase - "in order to" is redundant',
    confidence: 0.70,
    position: { start: 300, end: 311 }
  }
];

export function SuggestionDisplayDemo() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(demoSuggestions);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const handleAccept = (suggestion: Suggestion) => {
    console.log('Demo: Accepted suggestion', suggestion.id);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setAcceptedCount(prev => prev + 1);
  };

  const handleReject = (suggestion: Suggestion) => {
    console.log('Demo: Rejected suggestion', suggestion.id);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setRejectedCount(prev => prev + 1);
  };

  const handleReset = () => {
    setSuggestions(demoSuggestions);
    setAcceptedCount(0);
    setRejectedCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Suggestion Display System Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the AI suggestion display system with queuing,
          visual indicators, and keyboard shortcuts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{suggestions.length}</div>
          <div className="text-sm text-muted-foreground">Remaining</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {acceptedCount}
          </div>
          <div className="text-sm text-muted-foreground">Accepted</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {rejectedCount}
          </div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Features Demonstrated:</h2>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✓ Visual indicators for different suggestion types (grammar, style, SEO, clarity)</li>
          <li>✓ Suggestion queuing (max 3 visible at once)</li>
          <li>✓ Priority-based ordering (grammar → clarity → style → SEO)</li>
          <li>✓ Keyboard shortcuts (Tab to accept, Esc to reject)</li>
          <li>✓ Accept/reject controls with clear visual feedback</li>
          <li>✓ Confidence scores for high-confidence suggestions</li>
        </ul>
      </div>

      {/* Suggestion Display */}
      <div className="border rounded-lg p-6 bg-background">
        {suggestions.length > 0 ? (
          <SuggestionDisplay
            suggestions={suggestions}
            onAccept={handleAccept}
            onReject={handleReject}
            maxVisible={3}
          />
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">All suggestions processed!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You've reviewed all {acceptedCount + rejectedCount} suggestions.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Reset Demo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-blue-900 dark:text-blue-100">
          How to Use:
        </h2>
        <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
          <li>• Click "Aceptar" to accept a suggestion</li>
          <li>• Click "Rechazar" to reject a suggestion</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Tab</kbd> to accept the first suggestion</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Esc</kbd> to reject the first suggestion</li>
          <li>• Notice how suggestions are queued and displayed 3 at a time</li>
          <li>• Observe the different visual styles for each suggestion type</li>
        </ul>
      </div>
    </div>
  );
}
