"use client";

import { useState } from "react";
import AIWriterEditor from "../escritor-ia/components/AIWriterEditor";
import { toast } from "sonner";

/**
 * Test page for comprehensive error logging
 * This page simulates errors to verify the error logging implementation
 */
export default function TestErrorLoggingPage() {
  const [content, setContent] = useState("This is test content for error logging. It has more than 5 words.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [shouldError, setShouldError] = useState(true);

  // Simulate improvement with controlled errors
  const handleImprove = async () => {
    console.log('[TestErrorLogging] handleImprove called, shouldError:', shouldError);
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (shouldError) {
      setErrorCount(prev => prev + 1);
      setIsProcessing(false);
      throw new Error(`Simulated error #${errorCount + 1} for testing comprehensive logging`);
    }
    
    // Success case
    setContent(content + " [Improved]");
    setIsProcessing(false);
    toast.success("Content improved successfully!");
  };

  const handleSave = () => {
    toast.success("Content saved!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard!");
  };

  const handleOpenSettings = () => {
    toast.info("Settings panel opened");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Error Logging Test Page</h1>
          <p className="text-muted-foreground">
            This page tests the comprehensive error logging implementation for auto-improvement.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Test Controls</h2>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shouldError}
                onChange={(e) => setShouldError(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Simulate Errors</span>
            </label>
            
            <div className="text-sm text-muted-foreground">
              Errors triggered: {errorCount}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Instructions:</strong>
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Enable auto mode using the toggle in the editor header</li>
              <li>Type some text and wait 2 seconds (auto-improvement will trigger)</li>
              <li>Check the browser console for comprehensive error logs</li>
              <li>Trigger 3 consecutive errors to see the 30-second cooldown</li>
              <li>Uncheck "Simulate Errors" to test successful improvements</li>
            </ol>
          </div>

          <div className="bg-muted p-4 rounded space-y-2">
            <p className="text-sm font-medium">Expected Console Output:</p>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              <li>• Timestamp (ISO format)</li>
              <li>• Error message and stack trace</li>
              <li>• Editor state (content length, word count, flags)</li>
              <li>• Auto mode configuration</li>
              <li>• Auto-improvement state</li>
              <li>• Recent improvement history (last 5 errors)</li>
              <li>• Content preview (first 200 chars)</li>
            </ul>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <AIWriterEditor
            content={content}
            onContentChange={setContent}
            onImprove={handleImprove}
            onSave={handleSave}
            onCopy={handleCopy}
            onOpenSettings={handleOpenSettings}
            isProcessing={isProcessing}
          />
        </div>

        {/* Console Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
            📋 Open your browser's Developer Console (F12) to see the comprehensive error logs
          </p>
        </div>
      </div>
    </div>
  );
}
