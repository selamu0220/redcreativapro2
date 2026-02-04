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

  // Premium Minimal Design
  const getStatusColor = (): string => {
    if (!status.isEnabled) return 'text-muted-foreground';
    if (status.isActive) return 'text-emerald-600 dark:text-emerald-400';
    if (status.willActivateIn > 0) return 'text-amber-600 dark:text-amber-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getStatusIcon = () => {
    if (!status.isEnabled) return <BotOff className="w-3.5 h-3.5" />;
    if (status.isActive) return <Bot className="w-3.5 h-3.5" />;
    if (status.willActivateIn > 0) return <Clock className="w-3.5 h-3.5 animate-spin" />;
    return <Bot className="w-3.5 h-3.5" />;
  };

  const getStatusBg = (): string => {
    if (!status.isEnabled) return 'bg-muted/50 border-transparent';
    if (status.isActive) return 'bg-emerald-500/10 border-emerald-500/20';
    if (status.willActivateIn > 0) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Status Chip */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${getStatusBg()}`}>
        <div className={`relative flex items-center justify-center ${getStatusColor()}`}>
          {status.isActive && <span className="absolute inset-0 rounded-full animate-ping bg-current opacity-20"></span>}
          {getStatusIcon()}
        </div>

        <div className="flex flex-col leading-none">
          <span className={`text-[10px] uppercase tracking-wider font-bold ${getStatusColor()}`}>
            {status.isActive ? 'Agente Activo' : status.willActivateIn > 0 ? 'Analizando...' : 'Modo Agente'}
          </span>
        </div>
      </div>

      {/* Controls Group */}
      {showControls && (
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/40">
          {onToggleEnabled && (
            <button
              onClick={() => onToggleEnabled(!status.isEnabled)}
              className={`p-1.5 rounded-md transition-all hover:bg-background hover:shadow-sm ${status.isEnabled ? 'text-primary' : 'text-muted-foreground opacity-50'}`}
              title={status.isEnabled ? "Desactivar Agente" : "Activar Agente"}
            >
              {status.isEnabled ? <Bot className="w-3.5 h-3.5" /> : <BotOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {onToggleAutoActivate && status.isEnabled && (
            <button
              onClick={() => onToggleAutoActivate(!status.autoActivate)}
              className={`p-1.5 rounded-md transition-all hover:bg-background hover:shadow-sm ${status.autoActivate ? 'text-amber-600' : 'text-muted-foreground'}`}
              title={status.autoActivate ? "Auto-Activación ON" : "Auto-Activación OFF"}
            >
              {status.autoActivate ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}

      {/* Shortcut Hint - Subtle */}
      {showShortcutHint && (
        <span className="text-[10px] text-muted-foreground/40 font-mono border border-border/30 px-1.5 py-0.5 rounded">
          {getShortcutHint()}
        </span>
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
      className={`flex items-center justify-center p-2 rounded transition-colors ${status.isEnabled
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
