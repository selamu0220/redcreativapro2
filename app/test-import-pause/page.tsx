'use client';

import React, { useState } from 'react';
import AIWriterEditor from '../escritor-ia/components/AIWriterEditor';

/**
 * Test page for verifying import pause functionality
 * 
 * This page tests:
 * 1. Auto mode pauses when import button is clicked
 * 2. Auto mode resumes 5 seconds after import completes
 * 3. "Paused" indicator shows during pause
 */
export default function TestImportPausePage() {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);

  const handleImprove = async () => {
    setIsProcessing(true);
    console.log('[TestImportPause] Improvement triggered');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setContent(prev => prev + ' [IMPROVED]');
    setIsProcessing(false);
    console.log('[TestImportPause] Improvement completed');
  };

  const handleSave = () => {
    console.log('[TestImportPause] Save triggered');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    console.log('[TestImportPause] Content copied');
  };

  const handleOpenSettings = () => {
    console.log('[TestImportPause] Settings opened');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Import Pause Test</h1>
          <p className="text-muted-foreground">
            Test the auto mode pause functionality during import operations
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <AIWriterEditor
            content={content}
            onContentChange={setContent}
            onImprove={handleImprove}
            onSave={handleSave}
            onCopy={handleCopy}
            onOpenSettings={handleOpenSettings}
            isProcessing={isProcessing}
            autoModeEnabled={autoModeEnabled}
            onAutoModeToggle={setAutoModeEnabled}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Enable auto mode using the toggle in the editor header</li>
            <li>Type some text (at least 5 words) and wait 2 seconds - auto improvement should trigger</li>
            <li>Click the "Importar" button and select a file (TXT, PDF, or DOCX)</li>
            <li>Observe that the auto mode indicator shows "Paused" (yellow badge)</li>
            <li>Wait 5 seconds after import completes</li>
            <li>Verify that auto mode resumes automatically (indicator changes from "Paused" to "Active")</li>
            <li>Type more text and verify auto improvement works again after 2 seconds</li>
          </ol>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Expected Behavior:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Auto mode pauses immediately when import completes</li>
              <li>Indicator shows yellow "Paused" badge during 5-second pause</li>
              <li>Auto mode resumes automatically after 5 seconds</li>
              <li>Indicator changes to green "Active" badge when resumed</li>
              <li>Auto improvements work normally after resume</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Implementation Details
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Pause is triggered after successful import (TXT, PDF, or DOCX)</li>
            <li>Pause duration is exactly 5 seconds</li>
            <li>Pause state is managed by <code>pauseAutoMode(5000)</code> function</li>
            <li>AutoModeIndicator component shows pause state with yellow badge</li>
            <li>Auto mode resumes automatically via timeout cleanup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
