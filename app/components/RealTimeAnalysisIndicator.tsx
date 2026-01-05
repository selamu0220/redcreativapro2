/**
 * Real-Time Analysis Indicator Component
 * 
 * Displays the status of the real-time analysis engine:
 * - Analysis in progress indicator
 * - Time since last analysis
 * - Processing time
 * - Enable/disable toggle
 */

"use client";

import { Activity, Clock, Zap, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";

export interface RealTimeAnalysisIndicatorProps {
  isAnalyzing: boolean;
  timeSinceLastAnalysis: number;
  processingTime: number | null;
  isEnabled: boolean;
  onToggle?: (enabled: boolean) => void;
  suggestionsCount?: number;
}

export function RealTimeAnalysisIndicator({
  isAnalyzing,
  timeSinceLastAnalysis,
  processingTime,
  isEnabled,
  onToggle,
  suggestionsCount = 0
}: RealTimeAnalysisIndicatorProps) {
  const formatTime = (ms: number): string => {
    if (ms === Infinity) return '--';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${Math.round(ms / 1000)}s`;
  };

  const getStatusColor = (): string => {
    if (!isEnabled) return 'text-muted-foreground';
    if (isAnalyzing) return 'text-blue-500';
    if (timeSinceLastAnalysis < 2500) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getStatusText = (): string => {
    if (!isEnabled) return 'Desactivado';
    if (isAnalyzing) return 'Analizando...';
    if (timeSinceLastAnalysis === Infinity) return 'Esperando';
    return 'Activo';
  };

  return (
    <div className="flex items-center gap-4 text-xs">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`relative ${getStatusColor()}`}>
          {isAnalyzing ? (
            <Activity className="w-4 h-4 animate-pulse" />
          ) : isEnabled ? (
            <Zap className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isAnalyzing && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </div>
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Time Since Last Analysis */}
      {isEnabled && timeSinceLastAnalysis !== Infinity && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Hace {formatTime(timeSinceLastAnalysis)}</span>
        </div>
      )}

      {/* Processing Time */}
      {processingTime !== null && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider">Procesado en</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {formatTime(processingTime)}
          </Badge>
        </div>
      )}

      {/* Suggestions Count */}
      {suggestionsCount > 0 && (
        <Badge variant="default" className="text-[10px] px-2 py-0.5">
          {suggestionsCount} sugerencia{suggestionsCount !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Toggle Button */}
      {onToggle && (
        <button
          type="button"
          onClick={() => onToggle(!isEnabled)}
          className={`ml-auto px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-colors ${
            isEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {isEnabled ? 'Activado' : 'Desactivado'}
        </button>
      )}
    </div>
  );
}
