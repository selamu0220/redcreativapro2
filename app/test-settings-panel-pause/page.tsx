"use client";

import { useState, useCallback } from "react";
import AIWriterEditor from "../escritor-ia/components/AIWriterEditor";
import SettingsPanel from "../escritor-ia/components/SettingsPanel";
import { toast } from "sonner";

/**
 * Test Page for Settings Panel Pause Logic
 * 
 * This page tests that:
 * 1. Auto mode pauses when settings panel is opened
 * 2. Auto mode resumes when settings panel is closed
 * 3. Settings changes apply immediately
 */
export default function TestSettingsPanelPause() {
  const [content, setContent] = useState("This is test content for auto-improvement. Type here to test the auto mode pause when opening settings.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [improvementCount, setImprovementCount] = useState(0);

  const handleImprove = useCallback(async () => {
    console.log('[Test] Improvement triggered');
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate improvement
    setContent(prev => prev + " [IMPROVED]");
    setImprovementCount(prev => prev + 1);
    
    setIsProcessing(false);
    toast.success(`Improvement #${improvementCount + 1} completed`);
  }, [improvementCount]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Content saved");
    }, 500);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  }, [content]);

  const handleOpenSettings = useCallback(() => {
    console.log('[Test] Opening settings panel - auto mode should pause');
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    console.log('[Test] Closing settings panel - auto mode should resume');
    setIsSettingsOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Test Info */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Settings Panel Pause Logic Test
          </h1>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p><strong>Test Scenario:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Enable auto mode using the toggle</li>
              <li>Type in the editor and stop typing</li>
              <li>Auto mode should trigger improvement after 2 seconds</li>
              <li>Click "Configuración" button to open settings panel</li>
              <li>Auto mode should pause (no improvements while settings are open)</li>
              <li>Close settings panel</li>
              <li>Auto mode should resume immediately</li>
              <li>Type again and verify auto mode works</li>
            </ol>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Auto Mode:</span>
              <span className={`ml-2 font-bold ${autoModeEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {autoModeEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Settings Panel:</span>
              <span className={`ml-2 font-bold ${isSettingsOpen ? 'text-yellow-600' : 'text-gray-600'}`}>
                {isSettingsOpen ? 'OPEN (Paused)' : 'CLOSED'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Processing:</span>
              <span className={`ml-2 font-bold ${isProcessing ? 'text-blue-600' : 'text-gray-600'}`}>
                {isProcessing ? 'YES' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Improvements:</span>
              <span className="ml-2 font-bold text-primary">
                {improvementCount}
              </span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-zinc-900 border rounded-lg overflow-hidden">
          <AIWriterEditor
            content={content}
            onContentChange={setContent}
            onImprove={handleImprove}
            onSave={handleSave}
            onCopy={handleCopy}
            onOpenSettings={handleOpenSettings}
            isProcessing={isProcessing}
            isSaving={isSaving}
            autoModeEnabled={autoModeEnabled}
            onAutoModeToggle={setAutoModeEnabled}
            isSettingsPanelOpen={isSettingsOpen}
          />
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-3">
            Expected Behavior
          </h2>
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <p><strong>✓ When settings panel is CLOSED:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Auto mode should work normally (if enabled)</li>
              <li>Improvements should trigger 2 seconds after typing stops</li>
              <li>Status should show "CLOSED"</li>
            </ul>
            
            <p className="mt-3"><strong>✓ When settings panel is OPEN:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Auto mode should be paused</li>
              <li>No improvements should trigger, even after 2 seconds</li>
              <li>Status should show "OPEN (Paused)"</li>
              <li>Settings changes should apply immediately</li>
            </ul>
            
            <p className="mt-3"><strong>✓ When settings panel is CLOSED again:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Auto mode should resume immediately</li>
              <li>Next typing session should trigger improvements normally</li>
            </ul>
          </div>
        </div>

        {/* Console Log */}
        <div className="bg-gray-50 dark:bg-gray-950 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> Open browser console (F12) to see detailed logs about auto mode pause/resume behavior
          </p>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSettingsChange={(settings) => {
          console.log('[Test] Settings changed:', settings);
          toast.success('Settings updated');
        }}
      />
    </div>
  );
}
