'use client';

import React from 'react';

interface AutoModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  isPaused?: boolean;
}

export const AutoModeToggle: React.FC<AutoModeToggleProps> = ({
  enabled,
  onToggle,
  disabled = false,
  isProcessing = false,
  isPaused = false,
}) => {
  const handleClick = () => {
    if (!disabled && !isProcessing) {
      onToggle(!enabled);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled && !isProcessing) {
      e.preventDefault();
      onToggle(!enabled);
    }
  };

  // Determine visual state
  const getStateStyles = () => {
    if (disabled) {
      return {
        bg: 'bg-gray-300 dark:bg-gray-700',
        text: 'text-gray-500 dark:text-gray-400',
        label: 'Auto Mode: OFF',
        cursor: 'cursor-not-allowed',
      };
    }
    
    if (isProcessing) {
      return {
        bg: 'bg-blue-500 dark:bg-blue-600',
        text: 'text-white',
        label: 'Auto Mode: Processing',
        cursor: 'cursor-wait',
        animate: true,
      };
    }
    
    if (isPaused) {
      return {
        bg: 'bg-yellow-500 dark:bg-yellow-600',
        text: 'text-white',
        label: 'Auto Mode: Paused',
        cursor: 'cursor-pointer',
      };
    }
    
    if (enabled) {
      return {
        bg: 'bg-green-500 dark:bg-green-600',
        text: 'text-white',
        label: 'Auto Mode: ON',
        cursor: 'cursor-pointer',
      };
    }
    
    return {
      bg: 'bg-gray-400 dark:bg-gray-600',
      text: 'text-white',
      label: 'Auto Mode: OFF',
      cursor: 'cursor-pointer',
    };
  };

  const stateStyles = getStateStyles();
  const ariaChecked = enabled ? ('true' as const) : ('false' as const);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || isProcessing}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-md
        text-sm font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${stateStyles.bg} ${stateStyles.text} ${stateStyles.cursor}
        ${disabled ? 'opacity-50' : 'hover:opacity-90'}
      `}
      aria-label={stateStyles.label}
      aria-checked={ariaChecked}
      role="switch"
      tabIndex={disabled || isProcessing ? -1 : 0}
    >
      {/* Visual indicator dot */}
      <span
        className={`
          w-2 h-2 rounded-full
          ${stateStyles.animate ? 'animate-pulse' : ''}
          ${enabled && !isPaused && !isProcessing ? 'bg-white' : 'bg-white/70'}
        `}
        aria-hidden="true"
      />
      
      {/* Label text */}
      <span className="select-none">
        {stateStyles.label}
      </span>
    </button>
  );
};

export default AutoModeToggle;
