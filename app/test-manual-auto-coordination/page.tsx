'use client';

import { useState } from 'react';
import AIWriterEditor from '../escritor-ia/components/AIWriterEditor';
import { toast } from 'sonner';

/**
 * Test page for manual and auto mode coordination
 * 
 * This page demonstrates:
 * 1. Manual improvement pauses auto mode for 5 seconds
 * 2. Manual button is disabled when auto mode is processing
 * 3. Auto mode resumes automatically after manual improvement
 * 4. No concurrent improvements occur
 */
export default function TestManualAutoCoordination() {
  const [content, setContent] = useState('This is test content with enough words to trigger auto improvements. Keep typing to see the coordination in action.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [improvementLog, setImprovementLog] = useState<Array<{ time: string; type: string; message: string }>>([]);

  const addLog = (type: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    setImprovementLog(prev => [...prev, { time, type, message }]);
  };

  const handleImprove = async () => {
    addLog('manual', 'Manual improvement started');
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add improvement marker
    setContent(prev => prev + ' [IMPROVED]');
    
    setIsProcessing(false);
    addLog('manual', 'Manual improvement completed');
    toast.success('Content improved manually!');
  };

  const handleSave = () => {
    toast.success('Content saved!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const handleOpenSettings = () => {
    addLog('system', 'Settings opened - auto mode paused for 5 seconds');
    toast.info('Settings opened - auto mode paused');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Manual and Auto Mode Coordination Test</h1>
          <p className="text-muted-foreground">
            Test the coordination between manual and automatic improvements
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100">Test Instructions:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Enable auto mode using the toggle in the editor header</li>
            <li>Type some text and wait 2 seconds - auto improvement should trigger</li>
            <li>Click "Mejorar con IA" button - auto mode should pause for 5 seconds</li>
            <li>Try clicking the manual button while auto mode is processing - it should be disabled</li>
            <li>Import a file - auto mode should pause for 5 seconds</li>
            <li>Open settings - auto mode should pause for 5 seconds</li>
          </ul>
        </div>

        {/* Editor */}
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <AIWriterEditor
            content={content}
            onContentChange={setContent}
            onImprove={handleImprove}
            onSave={handleSave}
            onCopy={handleCopy}
            onOpenSettings={handleOpenSettings}
            isProcessing={isProcessing}
            disabled={false}
            autoModeEnabled={autoModeEnabled}
            onAutoModeToggle={setAutoModeEnabled}
          />
        </div>

        {/* Improvement Log */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Improvement Log</h2>
            <button
              onClick={() => setImprovementLog([])}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear Log
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {improvementLog.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No improvements yet...</p>
            ) : (
              improvementLog.map((log, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    log.type === 'manual'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : log.type === 'auto'
                      ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <span className="font-mono text-xs opacity-70">[{log.time}]</span>{' '}
                  <span className="font-semibold uppercase text-xs">{log.type}</span>:{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Auto Mode</h3>
            <p className={`text-2xl font-bold ${autoModeEnabled ? 'text-green-600' : 'text-gray-400'}`}>
              {autoModeEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Processing</h3>
            <p className={`text-2xl font-bold ${isProcessing ? 'text-blue-600' : 'text-gray-400'}`}>
              {isProcessing ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Word Count</h3>
            <p className="text-2xl font-bold text-foreground">
              {content.trim().split(/\s+/).length}
            </p>
          </div>
        </div>

        {/* Expected Behaviors */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-green-900 dark:text-green-100">Expected Behaviors:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
            <li>✅ Manual button remains enabled when auto mode is active</li>
            <li>✅ Manual button is disabled when auto mode is processing</li>
            <li>✅ Manual improvement pauses auto mode for 5 seconds</li>
            <li>✅ Auto mode resumes automatically after manual improvement</li>
            <li>✅ No concurrent improvements (manual and auto) occur</li>
            <li>✅ Import operations pause auto mode for 5 seconds</li>
            <li>✅ Opening settings pauses auto mode for 5 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
