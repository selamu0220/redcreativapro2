"use client";

import { useCallback, useRef, useEffect, useState } from 'react';

export interface AutoImprovementConfig {
  enabled: boolean;
  delay: number; // milliseconds
  minWords: number;
  improvementLevel: 'conservative' | 'balanced' | 'creative';
}

export interface AutoImprovementState {
  isTyping: boolean;
  isImproving: boolean;
  isPaused: boolean;
  lastImprovement: number;
  improvementCount: number;
  lastError: string | null;
  errorCount: number;
}

interface UseSimpleAutoImprovementProps {
  config: AutoImprovementConfig;
  onImprove: (content: string, isAuto: boolean) => Promise<void>;
  getCurrentContent: () => string;
  enabled?: boolean;
}

/**
 * Hook para mejora automática de texto después de dejar de escribir.
 * 
 * FUNCIONAMIENTO:
 * 1. El usuario escribe texto
 * 2. `handleTyping()` se llama en cada keystroke
 * 3. Cada llamada resetea un timer de 2 segundos
 * 4. Cuando el timer expira (2s sin escribir), se llama a `onImprove`
 * 5. El texto se mejora automáticamente
 * 
 * SOLUCIONES IMPLEMENTADAS:
 * - useRef para isImproving (evita closure stale)
 * - Mutex para prevenir mejoras simultáneas
 * - Cleanup correcto de timers
 */
export function useSimpleAutoImprovement({
  config,
  onImprove,
  getCurrentContent,
  enabled = true
}: UseSimpleAutoImprovementProps) {

  // =====================================================
  // REFS para estado mutable (evita problemas de closure)
  // =====================================================
  const isImprovingRef = useRef(false);
  const triggerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');

  // State para UI (solo lectura, no se usa en callbacks del timer)
  const [state, setState] = useState<AutoImprovementState>({
    isTyping: false,
    isImproving: false,
    isPaused: false,
    lastImprovement: 0,
    improvementCount: 0,
    lastError: null,
    errorCount: 0
  });

  // =====================================================
  // HELPERS
  // =====================================================

  const getWordCount = useCallback((text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, []);

  const cleanup = useCallback(() => {
    if (triggerTimerRef.current) {
      clearTimeout(triggerTimerRef.current);
      triggerTimerRef.current = null;
    }
  }, []);

  // =====================================================
  // CORE: Función de mejora (llamada cuando el timer expira)
  // =====================================================

  const executeImprovement = useCallback(async () => {
    // MUTEX: Verificar ref, no state (evita closure stale)
    if (isImprovingRef.current) {
      console.log('[AutoImprove] ⏸️ Ya hay una mejora en progreso, ignorando');
      return;
    }

    const content = getCurrentContent();
    const wordCount = getWordCount(content);

    console.log('[AutoImprove] ⏰ Timer expiró. Verificando condiciones...');
    console.log('[AutoImprove] 📝 Palabras:', wordCount, '/', config.minWords);

    // Verificar mínimo de palabras
    if (wordCount < config.minWords) {
      console.log('[AutoImprove] ❌ No hay suficientes palabras');
      setState(prev => ({ ...prev, isTyping: false }));
      return;
    }

    // Verificar que el contenido cambió desde la última mejora
    if (content === lastContentRef.current) {
      console.log('[AutoImprove] ❌ El contenido no ha cambiado');
      setState(prev => ({ ...prev, isTyping: false }));
      return;
    }

    // ACTIVAR MUTEX
    isImprovingRef.current = true;
    setState(prev => ({
      ...prev,
      isTyping: false,
      isImproving: true,
      lastError: null
    }));

    console.log('[AutoImprove] 🚀 Iniciando mejora automática...');

    try {
      await onImprove(content, true);

      // ÉXITO
      lastContentRef.current = getCurrentContent(); // Actualizar última versión mejorada
      console.log('[AutoImprove] ✅ Mejora completada');

      setState(prev => ({
        ...prev,
        isImproving: false,
        lastImprovement: Date.now(),
        improvementCount: prev.improvementCount + 1,
        lastError: null,
        errorCount: 0
      }));

    } catch (error: unknown) {
      console.error('[AutoImprove] ❌ Error en mejora:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      setState(prev => ({
        ...prev,
        isImproving: false,
        lastError: errorMessage,
        errorCount: prev.errorCount + 1
      }));
    } finally {
      // LIBERAR MUTEX
      isImprovingRef.current = false;
    }
  }, [config.minWords, getCurrentContent, getWordCount, onImprove]);

  // =====================================================
  // HANDLER: Llamar en cada keystroke
  // =====================================================

  const handleTyping = useCallback(() => {
    // Verificaciones iniciales
    if (!enabled || !config.enabled) {
      return;
    }

    // Si ya estamos mejorando, no iniciar nuevo timer
    if (isImprovingRef.current) {
      console.log('[AutoImprove] 🔒 Mejora en progreso, ignorando keystroke');
      return;
    }

    // Marcar como escribiendo
    setState(prev => ({ ...prev, isTyping: true }));

    // RESETEAR timer en cada keystroke
    if (triggerTimerRef.current) {
      clearTimeout(triggerTimerRef.current);
    }

    // Iniciar nuevo timer
    triggerTimerRef.current = setTimeout(() => {
      console.log('[AutoImprove] ⏰ Timer de', config.delay, 'ms expiró');
      executeImprovement();
    }, config.delay);

  }, [enabled, config.enabled, config.delay, executeImprovement]);

  // =====================================================
  // CLEANUP on unmount
  // =====================================================

  useEffect(() => {
    return () => {
      cleanup();
      isImprovingRef.current = false;
    };
  }, [cleanup]);

  // =====================================================
  // CLEAR ERROR function
  // =====================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, lastError: null, errorCount: 0 }));
  }, []);

  // =====================================================
  // PAUSE/RESUME functions
  // =====================================================

  const pause = useCallback(() => {
    cleanup();
    setState(prev => ({ ...prev, isPaused: true, isTyping: false }));
  }, [cleanup]);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    state,
    handleTyping,
    cleanup,
    clearError,
    pause,
    resume,
    getWordCount: () => getWordCount(getCurrentContent()),
    canImprove: !state.isImproving && !state.isPaused && enabled && config.enabled
  };
}
