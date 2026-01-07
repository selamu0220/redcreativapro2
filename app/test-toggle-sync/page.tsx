'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const AUTO_MODE_STORAGE_KEY = 'redcreativa-auto-mode-settings';

interface AutoModeConfig {
  enabled: boolean;
  delay: number;
  minWords: number;
  maxRetries: number;
  debounceDelay: number;
}

interface AutoModeStorage {
  enabled: boolean;
  config: AutoModeConfig;
  lastUsed: number;
}

export default function TestToggleSyncPage() {
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [localStorageValue, setLocalStorageValue] = useState<string>('');
  const [syncEvents, setSyncEvents] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState(false);

  // Load initial state
  useEffect(() => {
    const stored = localStorage.getItem(AUTO_MODE_STORAGE_KEY);
    if (stored) {
      const parsed: AutoModeStorage = JSON.parse(stored);
      setAutoModeEnabled(parsed.enabled);
      setLocalStorageValue(stored);
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTO_MODE_STORAGE_KEY && e.newValue) {
        const timestamp = new Date().toISOString();
        setSyncEvents(prev => [...prev, `[${timestamp}] Storage event: ${e.newValue}`]);
        const parsed: AutoModeStorage = JSON.parse(e.newValue);
        setAutoModeEnabled(parsed.enabled);
        setLocalStorageValue(e.newValue);
      }
    };

    const handleCustomStorageChange = ((e: CustomEvent) => {
      if (e.detail?.key === AUTO_MODE_STORAGE_KEY) {
        const timestamp = new Date().toISOString();
        const stored = localStorage.getItem(AUTO_MODE_STORAGE_KEY);
        if (stored) {
          setSyncEvents(prev => [...prev, `[${timestamp}] Custom event: ${stored}`]);
          const parsed: AutoModeStorage = JSON.parse(stored);
          setAutoModeEnabled(parsed.enabled);
          setLocalStorageValue(stored);
        }
      }
    }) as EventListener;

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  const handleToggle = () => {
    if (isToggling) {
      toast.error('Toggle already in progress');
      return;
    }

    setIsToggling(true);

    try {
      const newEnabled = !autoModeEnabled;
      
      // Update state
      setAutoModeEnabled(newEnabled);
      
      // Update localStorage
      const storage: AutoModeStorage = {
        enabled: newEnabled,
        config: {
          enabled: newEnabled,
          delay: 2000,
          minWords: 5,
          maxRetries: 3,
          debounceDelay: 1000
        },
        lastUsed: Date.now()
      };
      
      localStorage.setItem(AUTO_MODE_STORAGE_KEY, JSON.stringify(storage));
      setLocalStorageValue(JSON.stringify(storage));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key: AUTO_MODE_STORAGE_KEY, value: storage }
      }));
      
      const timestamp = new Date().toISOString();
      setSyncEvents(prev => [...prev, `[${timestamp}] Toggle: ${newEnabled}`]);
      
      toast.success(`Auto mode ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Toggle failed');
    } finally {
      setIsToggling(false);
    }
  };

  const clearEvents = () => {
    setSyncEvents([]);
  };

  const clearStorage = () => {
    localStorage.removeItem(AUTO_MODE_STORAGE_KEY);
    setAutoModeEnabled(false);
    setLocalStorageValue('');
    setSyncEvents(prev => [...prev, `[${new Date().toISOString()}] Storage cleared`]);
    toast.info('Storage cleared');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Toggle State Synchronization Test</h1>
          <p className="text-muted-foreground">
            Test that UI toggle, state, and localStorage all update together atomically
          </p>
        </div>

        {/* Current State */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Current State</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">UI State</p>
              <p className="font-mono text-lg">
                {autoModeEnabled ? (
                  <span className="text-green-600">✓ Enabled</span>
                ) : (
                  <span className="text-gray-600">✗ Disabled</span>
                )}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Toggle State</p>
              <p className="font-mono text-lg">
                {isToggling ? (
                  <span className="text-yellow-600">⟳ Toggling...</span>
                ) : (
                  <span className="text-blue-600">✓ Ready</span>
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">localStorage Value</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {localStorageValue || '(empty)'}
            </pre>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Controls</h2>
          
          <div className="flex gap-4">
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                autoModeEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isToggling ? 'Toggling...' : autoModeEnabled ? 'Disable Auto Mode' : 'Enable Auto Mode'}
            </button>
            
            <button
              onClick={clearStorage}
              className="px-6 py-3 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Storage
            </button>
          </div>
        </div>

        {/* Sync Events Log */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Synchronization Events</h2>
            <button
              onClick={clearEvents}
              className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80"
            >
              Clear Log
            </button>
          </div>
          
          <div className="bg-muted p-4 rounded max-h-96 overflow-y-auto">
            {syncEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet. Toggle auto mode to see synchronization.</p>
            ) : (
              <div className="space-y-1">
                {syncEvents.map((event, index) => (
                  <div key={index} className="text-xs font-mono">
                    {event}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Enable Auto Mode" and verify:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>UI State shows "✓ Enabled"</li>
                <li>localStorage Value updates immediately</li>
                <li>Sync event is logged</li>
                <li>Toast notification appears</li>
              </ul>
            </li>
            <li>Click "Disable Auto Mode" and verify the same synchronization</li>
            <li>Try rapid clicking - should prevent concurrent toggles</li>
            <li>Open browser DevTools → Application → Local Storage and verify the value matches</li>
            <li>Open this page in two tabs and toggle in one - verify the other tab syncs (storage event)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
