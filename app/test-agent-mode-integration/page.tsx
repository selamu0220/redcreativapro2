/**
 * Test Page for Agent Mode Change Tracking Integration
 * 
 * Demonstrates the complete integration of agent mode change tracking
 * with the EnhancedAIWriterEditor component.
 * 
 * Requirements: 2.3, 2.4
 */

"use client";

import { useState } from 'react';
import EnhancedAIWriterEditor from '../escritor-ia/components/EnhancedAIWriterEditor';
import { AnalysisResult } from '../lib/real-time-analysis-engine';

export default function TestAgentModeIntegrationPage() {
  const [content, setContent] = useState(`Welcome to the Agent Mode Change Tracking Integration Test!

This test page demonstrates the complete integration of agent mode change tracking with the AI Writer Editor.

Features being tested:
1. Agent mode activation (automatic after 3 seconds of no typing, or Shift+1)
2. Change tracking and highlighting
3. Changes summary display
4. Accept/reject individual or all changes
5. Undo/redo functionality with keyboard shortcuts (Ctrl+Z / Ctrl+Y)

Try it out:
- Type some text and wait 3 seconds to see agent mode activate
- Press Shift+1 to manually toggle agent mode
- Review the changes in the summary modal
- Accept or reject changes individually or in bulk
- Use Ctrl+Z to undo and Ctrl+Y to redo

The system will track all changes and allow you to review them before applying.`);

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [agentModeActivations, setAgentModeActivations] = useState(0);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResults(prev => [...prev.slice(-9), result]);
  };

  const handleAgentModeChange = (isActive: boolean) => {
    if (isActive) {
      setAgentModeActivations(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agent Mode Change Tracking Integration Test
          </h1>
          <p className="text-gray-600">
            Testing the complete integration of change tracking with the AI Writer Editor
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Content Length</div>
            <div className="text-3xl font-bold text-blue-600">{content.length}</div>
            <div className="text-xs text-gray-500 mt-1">characters</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Analysis Runs</div>
            <div className="text-3xl font-bold text-green-600">{analysisResults.length}</div>
            <div className="text-xs text-gray-500 mt-1">total analyses</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Agent Mode Activations</div>
            <div className="text-3xl font-bold text-purple-600">{agentModeActivations}</div>
            <div className="text-xs text-gray-500 mt-1">times activated</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Testing Instructions
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-bold">1.</span>
              <span>Type some text in the editor below and wait 3 seconds without typing</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">2.</span>
              <span>Agent mode will activate automatically and simulate some changes</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">3.</span>
              <span>A changes summary modal will appear showing all proposed changes</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">4.</span>
              <span>Review changes and accept/reject them individually or in bulk</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">5.</span>
              <span>Use the "Show changes" button to see highlighted changes in the editor</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">6.</span>
              <span>Use Ctrl+Z to undo and Ctrl+Y (or Cmd+Shift+Z on Mac) to redo</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">7.</span>
              <span>Press Shift+1 to manually toggle agent mode on/off</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Keyboard Shortcuts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Toggle Agent Mode</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Shift+1
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Accept Suggestion</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Tab
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Reject Suggestion</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Undo</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Ctrl+Z
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Redo (Windows/Linux)</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Ctrl+Y
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Redo (Mac)</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Cmd+Shift+Z
              </kbd>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <EnhancedAIWriterEditor
            content={content}
            onContentChange={handleContentChange}
            onImprove={() => console.log('Improve clicked')}
            onSave={() => console.log('Save clicked')}
            onCopy={() => console.log('Copy clicked')}
            onOpenSettings={() => console.log('Settings clicked')}
            isProcessing={false}
            isSaving={false}
            disabled={false}
            enableRealTimeAnalysis={true}
            enableAgentMode={true}
            onAnalysisComplete={handleAnalysisComplete}
            onAgentModeChange={handleAgentModeChange}
          />
        </div>

        {/* Recent Analysis Results */}
        {analysisResults.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Analysis Results
            </h2>
            <div className="space-y-2">
              {analysisResults.slice(-5).reverse().map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.suggestions.length} suggestions
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.processingTime}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Task 6: Integrate Agent Mode Change Tracking with Editor</p>
          <p className="mt-1">Requirements: 2.3, 2.4</p>
        </div>
      </div>
    </div>
  );
}
