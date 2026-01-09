'use client';

import React, { useEffect, useState } from 'react';
import type { AutoImprovementState } from '../hooks/useOptimizedAutoImprovement';
import type { AutoImprovementState as SimpleAutoImprovementState } from '../hooks/useSimpleAutoImprovement'; // Import simple state

// Create a union or compatible interface
type AnyAutoImprovementState = AutoImprovementState | SimpleAutoImprovementState;

interface AutoModeIndicatorProps {
  state: AnyAutoImprovementState;
  config: {
    enabled: boolean;
    minWords: number;
    delay: number;
    // Make other config properties optional since simple config might not have them all?
    // Actually config usually matches or simple config has fewer.
    [key: string]: any;
  };
  currentWordCount?: number;
}

export const AutoModeIndicator: React.FC<AutoModeIndicatorProps> = ({
  state,
  config,
  currentWordCount = 0,
}) => {
  const [timeSinceLastImprovement, setTimeSinceLastImprovement] = useState(0);

  // Helper to safely access optional properties
  const isPaused = 'isPaused' in state ? state.isPaused : false;
  const lastLatency = 'lastLatency' in state ? state.lastLatency : undefined;

  // Update time since last improvement every second
  useEffect(() => {
    const updateTime = () => {
      if (state.lastImprovement > 0) {
        setTimeSinceLastImprovement(Date.now() - state.lastImprovement);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [state.lastImprovement]);

  // Determine current status
  const getStatus = () => {
    if (!config.enabled) {
      return {
        label: 'Disabled',
        color: 'bg-gray-400 dark:bg-gray-600',
        textColor: 'text-gray-700 dark:text-gray-300',
      };
    }

    // Check if content is below minimum word count
    if (currentWordCount < config.minWords) {
      return {
        label: 'Content too short',
        color: 'bg-orange-500 dark:bg-orange-600',
        textColor: 'text-orange-700 dark:text-orange-300',
      };
    }

    if (state.isImproving) {
      return {
        label: 'Processing',
        color: 'bg-blue-500 dark:bg-blue-600',
        textColor: 'text-blue-700 dark:text-blue-300',
      };
    }

    if (isPaused) {
      return {
        label: 'Paused',
        color: 'bg-yellow-500 dark:bg-yellow-600',
        textColor: 'text-yellow-700 dark:text-yellow-300',
      };
    }

    return {
      label: 'Active',
      color: 'bg-green-500 dark:bg-green-600',
      textColor: 'text-green-700 dark:text-green-300',
    };
  };

  // Format time duration
  const formatTime = (ms: number): string => {
    if (ms === 0) return 'Never';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s ago`;
    }
    return `${seconds}s ago`;
  };

  const status = getStatus();

  // Tooltip content
  const tooltipContent = `
Status: ${status.label}
Last improvement: ${formatTime(timeSinceLastImprovement)}
Improvements: ${state.improvementCount}
Last latency: ${lastLatency ? lastLatency + 'ms' : 'N/A'}
Current words: ${currentWordCount}
Min words: ${config.minWords}
Delay: ${(config.delay || 0) / 1000}s
  `.trim();

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      title={tooltipContent}
      role="status"
      aria-live="polite"
      aria-label={`Auto mode status: ${status.label}`}
    >
      {/* Status badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${status.color} ${state.isImproving ? 'animate-pulse' : ''
            }`}
          aria-hidden="true"
        />
        <span className={`font-medium ${status.textColor}`}>
          {status.label}
        </span>
      </div>

      {/* Divider */}
      {config.enabled && (
        <>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">
            |
          </span>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            {/* Improvement count */}
            <div className="flex items-center gap-1">
              <span className="font-semibold">{state.improvementCount}</span>
              <span className="hidden sm:inline">
                {state.improvementCount === 1 ? 'improvement' : 'improvements'}
              </span>
              <span className="sm:hidden">✓</span>
            </div>

            {/* Time since last improvement */}
            {state.lastImprovement > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">
                  •
                </span>
                <div className="hidden md:flex items-center gap-1">
                  <span>{formatTime(timeSinceLastImprovement)}</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AutoModeIndicator;
