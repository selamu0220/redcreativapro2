'use client';

import { useState } from 'react';
import { useOptimizedAutoImprovement, useAutoImprovementConfig } from '../hooks/useOptimizedAutoImprovement';
import AutoModeIndicator from '../components/AutoModeIndicator';

export default function TestWordCountValidation() {
  const [content, setContent] = useState('');
  const [improvementLog, setImprovementLog] = useState<string[]>([]);

  const { config } = useAutoImprovementConfig({
    enabled: true,
    delay: 2000,
    minWords: 5,
    maxRetries: 3,
    debounceDelay: 1000
  });

  const getCurrentContent = () => content;

  const handleImprove = async (contentToImprove: string, isAuto: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    const wordCount = contentToImprove.trim().split(/\s+/).length;
    setImprovementLog(prev => [
      ...prev,
      `[${timestamp}] ${isAuto ? 'AUTO' : 'MANUAL'} improvement triggered (${wordCount} words)`
    ]);
  };

  const {
    handleTyping,
    state,
    getWordCount,
    meetsMinimumWords
  } = useOptimizedAutoImprovement({
    config,
    onImprove: handleImprove,
    getCurrentContent,
    enabled: true
  });

  const currentWordCount = getWordCount();
  const meetsMinWords = meetsMinimumWords();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Word Count Validation Test</h1>
          
          <div className="space-y-4">
            {/* Status Display */}
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Current Word Count:</span>{' '}
                  <span className={currentWordCount < config.minWords ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                    {currentWordCount}
                  </span>
                  {' / '}
                  <span className="text-gray-600 dark:text-gray-400">{config.minWords} minimum</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Meets Minimum:</span>{' '}
                  <span className={meetsMinWords ? 'text-green-500' : 'text-red-500'}>
                    {meetsMinWords ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Auto-improvement will trigger:</span>{' '}
                  <span className={meetsMinWords ? 'text-green-500' : 'text-red-500'}>
                    {meetsMinWords ? '✓ Yes (after typing stops)' : '✗ No (content too short)'}
                  </span>
                </div>
              </div>
              
              <AutoModeIndicator
                state={state}
                config={config}
                currentWordCount={currentWordCount}
              />
            </div>

            {/* Test Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Test Instructions:</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>Type less than 5 words - indicator should show "Content too short" (orange)</li>
                <li>Type 5 or more words - indicator should show "Active" (green)</li>
                <li>Stop typing for 2 seconds - auto-improvement should trigger (only if ≥5 words)</li>
                <li>Check the improvement log below to verify behavior</li>
              </ol>
            </div>

            {/* Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content (type and stop to test auto-improvement)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleTyping();
                }}
                placeholder="Type at least 5 words to trigger auto-improvement..."
                className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Character count: {content.length}
              </div>
            </div>

            {/* Improvement Log */}
            <div>
              <h2 className="font-semibold mb-2">Improvement Log:</h2>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-48 overflow-y-auto">
                {improvementLog.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No improvements yet. Type content and wait 2 seconds after stopping.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {improvementLog.map((log, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setImprovementLog([])}
                className="mt-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
              >
                Clear Log
              </button>
            </div>

            {/* Test Cases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setContent('Hi there');
                  handleTyping();
                }}
                className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                <div className="font-semibold text-red-900 dark:text-red-100">Test: 2 words</div>
                <div className="text-sm text-red-700 dark:text-red-300">Should NOT trigger</div>
              </button>

              <button
                onClick={() => {
                  setContent('This is exactly five words');
                  handleTyping();
                }}
                className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <div className="font-semibold text-yellow-900 dark:text-yellow-100">Test: 5 words</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Should trigger (minimum)</div>
              </button>

              <button
                onClick={() => {
                  setContent('This is a longer sentence with more than five words in it');
                  handleTyping();
                }}
                className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="font-semibold text-green-900 dark:text-green-100">Test: 12 words</div>
                <div className="text-sm text-green-700 dark:text-green-300">Should trigger</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
