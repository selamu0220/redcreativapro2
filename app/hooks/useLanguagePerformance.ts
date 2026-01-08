'use client';

import { useEffect, useRef, useCallback } from 'react';
import { translationCache } from '../lib/language/cache';

interface PerformanceMetrics {
  renderTime: number;
  cacheHitRate: number;
  translationLoadTime: number;
  memoryUsage?: number;
}

/**
 * Hook para monitorear el rendimiento del sistema de idiomas
 */
export function useLanguagePerformance() {
  const renderStartTime = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({
    renderTime: 0,
    cacheHitRate: 0,
    translationLoadTime: 0
  });

  // Marcar inicio de render
  const markRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // Marcar fin de render y calcular tiempo
  const markRenderEnd = useCallback(() => {
    if (renderStartTime.current > 0) {
      metrics.current.renderTime = performance.now() - renderStartTime.current;
      renderStartTime.current = 0;
    }
  }, []);

  // Medir tiempo de carga de traducciones
  const measureTranslationLoad = useCallback(async <T>(
    loadFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await loadFunction();
      metrics.current.translationLoadTime = performance.now() - startTime;
      return result;
    } catch (error) {
      metrics.current.translationLoadTime = performance.now() - startTime;
      throw error;
    }
  }, []);

  // Obtener estadísticas de cache
  const getCacheStats = useCallback(() => {
    const stats = translationCache.getStats();
    metrics.current.cacheHitRate = stats.hitRate;
    return stats;
  }, []);

  // Obtener métricas actuales
  const getMetrics = useCallback((): PerformanceMetrics => {
    // Intentar obtener uso de memoria si está disponible
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.current.memoryUsage = memInfo.usedJSHeapSize;
    }

    return { ...metrics.current };
  }, []);

  // Log de métricas para desarrollo
  const logMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const currentMetrics = getMetrics();
      const cacheStats = getCacheStats();
      
      console.group('🌐 Language System Performance');
      console.log('Render Time:', `${currentMetrics.renderTime.toFixed(2)}ms`);
      console.log('Translation Load Time:', `${currentMetrics.translationLoadTime.toFixed(2)}ms`);
      console.log('Cache Hit Rate:', `${(currentMetrics.cacheHitRate * 100).toFixed(1)}%`);
      console.log('Cache Stats:', cacheStats);
      if (currentMetrics.memoryUsage) {
        console.log('Memory Usage:', `${(currentMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
      console.groupEnd();
    }
  }, [getMetrics, getCacheStats]);

  // Limpiar métricas
  const resetMetrics = useCallback(() => {
    metrics.current = {
      renderTime: 0,
      cacheHitRate: 0,
      translationLoadTime: 0
    };
  }, []);

  // Efecto para marcar inicio de render automáticamente
  useEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  return {
    markRenderStart,
    markRenderEnd,
    measureTranslationLoad,
    getCacheStats,
    getMetrics,
    logMetrics,
    resetMetrics
  };
}

/**
 * Hook simplificado para componentes que solo necesitan logging básico
 */
export function useLanguagePerformanceLogger(componentName: string) {
  const { logMetrics } = useLanguagePerformance();

  useEffect(() => {
    // Log métricas después de que el componente se monte
    const timer = setTimeout(() => {
      console.log(`📊 Performance metrics for ${componentName}:`);
      logMetrics();
    }, 100);

    return () => clearTimeout(timer);
  }, [componentName, logMetrics]);
}

/**
 * Utilidad para medir el rendimiento de funciones async
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name} completed in ${(endTime - startTime).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${name} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
      }
      
      throw error;
    }
  }) as T;
}