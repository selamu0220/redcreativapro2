'use client';

import React from 'react';
import type { AutoImprovementConfig } from '../hooks/useOptimizedAutoImprovement';

interface AutoModeSettingsProps {
  config: AutoImprovementConfig;
  onChange: (config: Partial<AutoImprovementConfig>) => void;
  onReset: () => void;
}

/**
 * AutoModeSettings Component
 * 
 * Configuration panel for automatic text improvement behavior.
 * Allows users to customize:
 * - Delay after typing stops (1-10 seconds)
 * - Minimum word count threshold (5-50 words)
 * - Debounce delay for typing detection (500-2000ms)
 * - Enable/disable toggle
 * 
 * All settings are validated and persisted to localStorage.
 */
export const AutoModeSettings: React.FC<AutoModeSettingsProps> = ({
  config,
  onChange,
  onReset,
}) => {
  // Validation bounds
  const BOUNDS = {
    delay: { min: 1000, max: 10000, step: 500 }, // 1-10 seconds
    minWords: { min: 5, max: 50, step: 1 },
    debounceDelay: { min: 500, max: 2000, step: 100 }, // 0.5-2 seconds
  };

  // Validate and constrain values
  const validateValue = (
    value: number,
    bounds: { min: number; max: number }
  ): number => {
    return Math.max(bounds.min, Math.min(bounds.max, value));
  };

  // Handle delay change
  const handleDelayChange = (value: number) => {
    const validated = validateValue(value, BOUNDS.delay);
    onChange({ delay: validated });
  };

  // Handle minimum words change
  const handleMinWordsChange = (value: number) => {
    const validated = validateValue(value, BOUNDS.minWords);
    onChange({ minWords: validated });
  };

  // Handle debounce delay change
  const handleDebounceDelayChange = (value: number) => {
    const validated = validateValue(value, BOUNDS.debounceDelay);
    onChange({ debounceDelay: validated });
  };

  // Handle enable/disable toggle
  const handleEnabledToggle = (enabled: boolean) => {
    onChange({ enabled });
  };

  // Handle improvement level change
  const handleLevelChange = (level: 'conservative' | 'balanced' | 'creative') => {
    onChange({ improvementLevel: level });
  };

  // Get label for improvement level
  const getLevelLabel = (level: 'conservative' | 'balanced' | 'creative'): string => {
    switch (level) {
      case 'conservative':
        return 'Conservador';
      case 'balanced':
        return 'Equilibrado';
      case 'creative':
        return 'Creativo';
    }
  };

  // Format milliseconds to seconds for display
  const formatSeconds = (ms: number): string => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Modo Automático
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configura el comportamiento de las mejoras automáticas
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex-1">
          <label
            htmlFor="auto-mode-enabled"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Activar Modo Automático
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Mejora el texto automáticamente mientras escribes
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="auto-mode-enabled"
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleEnabledToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Settings (only shown when enabled) */}
      {config.enabled && (
        <div className="space-y-5">
          {/* Improvement Level Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Nivel de Mejora
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['conservative', 'balanced', 'creative'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleLevelChange(level)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    config.improvementLevel === level
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {getLevelLabel(level)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {config.improvementLevel === 'conservative' && 'Solo correcciones gramaticales y ortográficas básicas.'}
              {config.improvementLevel === 'balanced' && 'Mejora fluidez y tono sin cambiar el significado.'}
              {config.improvementLevel === 'creative' && 'Reescribe para mayor impacto y estilo.'}
            </p>
          </div>

          {/* Delay Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="delay-slider"
                className="text-sm font-medium text-foreground"
              >
                Tiempo de Espera
              </label>
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                {formatSeconds(config.delay)}s
              </span>
            </div>
            <input
              id="delay-slider"
              type="range"
              min={BOUNDS.delay.min}
              max={BOUNDS.delay.max}
              step={BOUNDS.delay.step}
              value={config.delay}
              onChange={(e) => handleDelayChange(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Tiempo de espera después de dejar de escribir"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1s (Rápido)</span>
              <span>10s (Lento)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo que espera después de dejar de escribir antes de mejorar el texto
            </p>
          </div>

          {/* Minimum Words Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="min-words-slider"
                className="text-sm font-medium text-foreground"
              >
                Palabras Mínimas
              </label>
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                {config.minWords}
              </span>
            </div>
            <input
              id="min-words-slider"
              type="range"
              min={BOUNDS.minWords.min}
              max={BOUNDS.minWords.max}
              step={BOUNDS.minWords.step}
              value={config.minWords}
              onChange={(e) => handleMinWordsChange(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Número mínimo de palabras para activar mejora automática"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 palabras</span>
              <span>50 palabras</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cantidad mínima de palabras necesarias para activar la mejora automática
            </p>
          </div>

          {/* Debounce Delay Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="debounce-slider"
                className="text-sm font-medium text-foreground"
              >
                Sensibilidad de Escritura
              </label>
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                {formatSeconds(config.debounceDelay)}s
              </span>
            </div>
            <input
              id="debounce-slider"
              type="range"
              min={BOUNDS.debounceDelay.min}
              max={BOUNDS.debounceDelay.max}
              step={BOUNDS.debounceDelay.step}
              value={config.debounceDelay}
              onChange={(e) =>
                handleDebounceDelayChange(parseInt(e.target.value))
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Tiempo de detección de escritura"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5s (Sensible)</span>
              <span>2s (Tolerante)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo que espera para detectar que dejaste de escribir
            </p>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="pt-4 border-t">
        <button
          type="button"
          onClick={onReset}
          className="w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Restablecer a Valores Predeterminados
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Cómo Funciona
        </h4>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <svg
              className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            El modo automático detecta cuando dejas de escribir
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Espera el tiempo configurado antes de mejorar
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Solo se activa si tienes el mínimo de palabras
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Puedes seguir usando el botón manual cuando quieras
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AutoModeSettings;
