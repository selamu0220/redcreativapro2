'use client';

import { useState } from 'react';
import SettingsPanel from '../escritor-ia/components/SettingsPanel';

/**
 * Test page for Auto Mode Settings Integration
 * 
 * This page tests that:
 * 1. SettingsPanel opens and displays AutoModeSettings
 * 2. Auto mode configuration can be changed
 * 3. Configuration persists to localStorage
 * 4. Reset functionality works
 */
export default function TestAutoModeSettingsIntegration() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsChangeCount, setSettingsChangeCount] = useState(0);

  const handleSettingsChange = (settings: any) => {
    console.log('[Test] Settings changed:', settings);
    setSettingsChangeCount(prev => prev + 1);
  };

  const checkLocalStorage = () => {
    const stored = localStorage.getItem('redcreativa-auto-mode-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[Test] Current localStorage:', parsed);
      alert(`Auto Mode Config:\n${JSON.stringify(parsed, null, 2)}`);
    } else {
      alert('No auto mode settings in localStorage');
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('redcreativa-auto-mode-settings');
    console.log('[Test] Cleared auto mode settings from localStorage');
    alert('Auto mode settings cleared from localStorage');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Auto Mode Settings Integration Test
          </h1>
          <p className="text-muted-foreground">
            Test the integration of AutoModeSettings into SettingsPanel
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Open Settings Panel
            </button>

            <button
              onClick={checkLocalStorage}
              className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            >
              Check localStorage
            </button>

            <button
              onClick={clearLocalStorage}
              className="px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
            >
              Clear localStorage
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/90 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>

        {/* Test Status */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test Status</h2>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span className="text-sm font-medium">Settings Panel Open:</span>
              <span className={`text-sm font-mono ${isSettingsOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isSettingsOpen ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span className="text-sm font-medium">Settings Changes:</span>
              <span className="text-sm font-mono text-primary">
                {settingsChangeCount}
              </span>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Test Instructions</h2>
          
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Click "Open Settings Panel" to open the settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Scroll down to find the "Auto Mode Settings" section</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Toggle the "Activar Modo Automático" switch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">4.</span>
              <span>Adjust the sliders (Tiempo de Espera, Palabras Mínimas, Sensibilidad)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">5.</span>
              <span>Close the settings panel (changes save immediately)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">6.</span>
              <span>Click "Check localStorage" to verify settings were saved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">7.</span>
              <span>Click "Reload Page" and open settings again to verify persistence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">8.</span>
              <span>Click "Restablecer a Valores Predeterminados" to test reset</span>
            </li>
          </ol>
        </div>

        {/* Expected Behavior */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Expected Behavior</h2>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Settings panel should display AutoModeSettings component</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Configuration changes should save immediately to localStorage</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Settings should persist across page reloads</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Reset button should restore default values</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Console should log configuration changes</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
