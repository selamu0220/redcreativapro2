"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import './ai-progress-indicator.css';

export interface AIOperationProgress {
  stage: 'initializing' | 'processing' | 'generating' | 'finalizing' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
  tokensProcessed?: number;
  totalTokens?: number;
}

interface AIProgressIndicatorProps {
  isActive: boolean;
  progress: AIOperationProgress;
  onCancel?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const STAGE_MESSAGES = {
  initializing: 'Inicializando IA...',
  processing: 'Procesando contenido...',
  generating: 'Generando mejoras...',
  finalizing: 'Finalizando...',
  completed: 'Completado',
  error: 'Error en el proceso'
};

const STAGE_ICONS = {
  initializing: Clock,
  processing: RefreshCw,
  generating: Zap,
  finalizing: RefreshCw,
  completed: CheckCircle,
  error: XCircle
};

export default function AIProgressIndicator({
  isActive,
  progress,
  onCancel,
  showDetails = true,
  compact = false,
  className = ''
}: AIProgressIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgressColor = () => {
    if (progress.stage === 'error') return 'bg-red-500';
    if (progress.stage === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'error': return 'text-red-600';
      case 'completed': return 'text-green-600';
      case 'initializing': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const Icon = STAGE_ICONS[progress.stage];

  if (!isActive && progress.stage !== 'completed' && progress.stage !== 'error') {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Icon 
          className={`w-4 h-4 ${getStageColor()} ${
            progress.stage === 'processing' || progress.stage === 'generating' ? 'animate-spin' : ''
          }`} 
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {progress.message || STAGE_MESSAGES[progress.stage]}
          </div>
          {progress.progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className={`h-1 rounded-full ai-progress-bar-compact ${getProgressColor()} ai-progress-width-${Math.min(100, Math.max(0, Math.round(progress.progress / 5) * 5))}`}
              />
            </div>
          )}
        </div>
        {onCancel && progress.stage !== 'completed' && progress.stage !== 'error' && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Cancelar"
            aria-label="Cancelar operación de IA"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon 
            className={`w-5 h-5 ${getStageColor()} ${
              progress.stage === 'processing' || progress.stage === 'generating' ? 'animate-spin' : ''
            }`} 
          />
          <h3 className="text-sm font-medium text-gray-900">
            Procesamiento de IA
          </h3>
        </div>
        {onCancel && progress.stage !== 'completed' && progress.stage !== 'error' && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
            title="Cancelar operación"
            aria-label="Cancelar operación de IA"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{progress.message || STAGE_MESSAGES[progress.stage]}</span>
          <span>{Math.round(progress.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ai-progress-bar ${getProgressColor()} ai-progress-width-${Math.min(100, Math.max(0, Math.round(progress.progress / 5) * 5))}`}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Tiempo transcurrido:</span>
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
          
          {progress.estimatedTimeRemaining !== undefined && (
            <div className="flex justify-between">
              <span>Tiempo estimado restante:</span>
              <span className="font-mono">{formatTime(progress.estimatedTimeRemaining)}</span>
            </div>
          )}

          {progress.tokensProcessed !== undefined && progress.totalTokens !== undefined && (
            <div className="flex justify-between">
              <span>Tokens procesados:</span>
              <span className="font-mono">
                {progress.tokensProcessed.toLocaleString()} / {progress.totalTokens.toLocaleString()}
              </span>
            </div>
          )}

          {/* Stage-specific information */}
          {progress.stage === 'processing' && (
            <div className="flex items-center space-x-1 text-blue-600">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Analizando contenido y contexto...</span>
            </div>
          )}

          {progress.stage === 'generating' && (
            <div className="flex items-center space-x-1 text-blue-600">
              <Zap className="w-3 h-3" />
              <span>Generando texto mejorado...</span>
            </div>
          )}

          {progress.stage === 'error' && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Se produjo un error durante el procesamiento</span>
            </div>
          )}

          {progress.stage === 'completed' && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>Texto mejorado exitosamente</span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons for error state */}
      {progress.stage === 'error' && (
        <div className="mt-3 flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            aria-label="Cerrar indicador de progreso"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

// Hook for managing AI operation progress
export function useAIProgress() {
  const [progress, setProgress] = useState<AIOperationProgress>({
    stage: 'initializing',
    progress: 0,
    message: ''
  });
  const [isActive, setIsActive] = useState(false);

  const startOperation = (initialMessage?: string) => {
    setIsActive(true);
    setProgress({
      stage: 'initializing',
      progress: 0,
      message: initialMessage || 'Iniciando operación...'
    });
  };

  const updateProgress = (updates: Partial<AIOperationProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const completeOperation = (message?: string) => {
    setProgress(prev => ({
      ...prev,
      stage: 'completed',
      progress: 100,
      message: message || 'Operación completada'
    }));
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      setIsActive(false);
    }, 2000);
  };

  const errorOperation = (message?: string) => {
    setProgress(prev => ({
      ...prev,
      stage: 'error',
      message: message || 'Error en la operación'
    }));
  };

  const cancelOperation = () => {
    setIsActive(false);
    setProgress({
      stage: 'initializing',
      progress: 0,
      message: ''
    });
  };

  return {
    progress,
    isActive,
    startOperation,
    updateProgress,
    completeOperation,
    errorOperation,
    cancelOperation
  };
}