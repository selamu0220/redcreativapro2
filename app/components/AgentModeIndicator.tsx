/**
 * Agent Mode Status Indicator
 * 
 * Visual indicator showing:
 * - Whether agent mode is active
 * - Whether agent mode is enabled
 * - Countdown until activation
 * - Manual toggle control
 * - Keyboard shortcut hint (Shift+1)
 * 
 * Requirements: 2.1, 2.5, 3.1, 3.2, 3.3
 */

"use client";

import { Bot, BotOff, Clock, Zap, ZapOff, Keyboard } from 'lucide-react';
import { AgentModeStatus } from '../lib/agent-mode-activation';

interface AgentModeIndicatorProps {
  status: AgentModeStatus;
  onToggleEnabled?: (enabled: boolean) => void;
  onToggleAutoActivate?: (autoActivate: boolean) => void;
  className?: string;
  showControls?: boolean;
  showShortcutHint?: boolean;
}

/**
 * Agent Mode Indicator Component
 * 
 * Displays the current status of agent mode with visual feedback
 * and optional controls for toggling settings.
 */
export function AgentModeIndicator({
  status,
  onToggleEnabled,
  onToggleAutoActivate,
  className = '',
  showControls = true,
  showShortcutHint = true
}: AgentModeIndicatorProps) {
  const formatTime = (ms: number): string => {
    if (ms === Infinity || ms <= 0) return '--';
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getShortcutHint = (): string => {
    // Detect platform for display
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    return isMac ? '⇧1' : 'Shift+1';
  };

  const getStatusColor = (): string => {
    if (!status.isEnabled) return 'text-gray-400';
    if (status.isActive) return 'text-green-600';
    if (status.willActivateIn > 0) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusBgColor = (): string => {
    if (!status.isEnabled) return 'bg-gray-100';
    if (status.isActive) return 'bg-green-50';
    if (status.willActivateIn > 0) return 'bg-yellow-50';
    return 'bg-blue-50';
  };

  const getStatusText = (): string => {
    if (!status.isEnabled) return 'Desactivado';
    if (status.isActive) return 'Activo';
    if (status.willActivateIn > 0) return `Activando en ${formatTime(status.willActivateIn)}`;
    return 'Esperando';
  };

  const getStatusIcon = () => {
    if (!status.isEnabled) {
      return <BotOff className="w-4 h-4" />;
    }
    if (status.isActive) {
      return <Bot className="w-4 h-4 animate-pulse" />;
    }
    if (status.willActivateIn > 0) {
      return <Clock className="w-4 h-4 animate-spin" />;
    }
    return <Bot className="w-4 h-4" />;
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Status Display */}
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${getStatusBgColor()}`}>
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            Modo Agente
          </span>
          <span className="text-xs text-gray-600">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center space-x-2">
          {/* Enable/Disable Toggle */}
          {onToggleEnabled && (
            <button
              type="button"
              onClick={() => onToggleEnabled(!status.isEnabled)}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                status.isEnabled
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={status.isEnabled ? 'Desactivar modo agente' : 'Activar modo agente'}
              aria-label={status.isEnabled ? 'Desactivar modo agente' : 'Activar modo agente'}
              aria-pressed={status.isEnabled ? "true" : "false"}
            >
              {status.isEnabled ? (
                <>
                  <Bot className="w-3 h-3" />
                  <span>Activado</span>
                </>
              ) : (
                <>
                  <BotOff className="w-3 h-3" />
                  <span>Desactivado</span>
                </>
              )}
            </button>
          )}

          {/* Auto-Activate Toggle */}
          {onToggleAutoActivate && status.isEnabled && (
            <button
              type="button"
              onClick={() => onToggleAutoActivate(!status.autoActivate)}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                status.autoActivate
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={status.autoActivate ? 'Desactivar activación automática' : 'Activar activación automática'}
              aria-label={status.autoActivate ? 'Desactivar activación automática' : 'Activar activación automática'}
              aria-pressed={status.autoActivate ? "true" : "false"}
            >
              {status.autoActivate ? (
                <>
                  <Zap className="w-3 h-3" />
                  <span>Auto</span>
                </>
              ) : (
                <>
                  <ZapOff className="w-3 h-3" />
                  <span>Manual</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Additional Info */}
      {status.isEnabled && !status.isActive && status.timeSinceLastTyping !== Infinity && (
        <div className="text-xs text-gray-500">
          Última actividad: {formatTime(status.timeSinceLastTyping)} atrás
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      {showShortcutHint && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
          <Keyboard className="w-3 h-3" />
          <span>{getShortcutHint()}</span>
          <span className="text-gray-400">para alternar</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Agent Mode Indicator
 * 
 * A smaller version for use in toolbars or status bars
 */
export function AgentModeIndicatorCompact({
  status,
  onToggleEnabled,
  className = ''
}: Pick<AgentModeIndicatorProps, 'status' | 'onToggleEnabled' | 'className'>) {
  const getStatusColor = (): string => {
    if (!status.isEnabled) return 'text-gray-400';
    if (status.isActive) return 'text-green-600';
    if (status.willActivateIn > 0) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (!status.isEnabled) {
      return <BotOff className="w-4 h-4" />;
    }
    if (status.isActive) {
      return <Bot className="w-4 h-4 animate-pulse" />;
    }
    if (status.willActivateIn > 0) {
      return <Clock className="w-4 h-4" />;
    }
    return <Bot className="w-4 h-4" />;
  };

  const getTooltip = (): string => {
    if (!status.isEnabled) return 'Modo agente desactivado';
    if (status.isActive) return 'Modo agente activo';
    if (status.willActivateIn > 0) {
      const seconds = Math.ceil(status.willActivateIn / 1000);
      return `Activando en ${seconds}s`;
    }
    return 'Modo agente esperando';
  };

  return (
    <button
      type="button"
      onClick={() => onToggleEnabled && onToggleEnabled(!status.isEnabled)}
      className={`flex items-center justify-center p-2 rounded transition-colors ${
        status.isEnabled
          ? 'hover:bg-blue-50'
          : 'hover:bg-gray-100'
      } ${className}`}
      title={getTooltip()}
      aria-label={getTooltip()}
      aria-pressed={status.isEnabled ? "true" : "false"}
    >
      <div className={getStatusColor()}>
        {getStatusIcon()}
      </div>
    </button>
  );
}
