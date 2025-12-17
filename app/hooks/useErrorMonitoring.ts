"use client";

import { useEffect, useCallback, useRef, useState } from 'react';
import ErrorLogger, { AppError, ErrorType, ErrorSeverity } from '@/app/lib/error-logging/ErrorLogger';
import ErrorRecoveryManager from '@/app/lib/error-logging/ErrorRecoveryManager';

export interface ErrorMonitoringConfig {
  enableAutoRecovery?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  maxRetries?: number;
  userId?: string;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recoverySuccessRate: number;
  lastError?: AppError;
}

export const useErrorMonitoring = (config: ErrorMonitoringConfig = {}) => {
  const {
    enableAutoRecovery = true,
    enablePerformanceMonitoring = true,
    enableNetworkMonitoring = true,
    maxRetries = 3,
    userId
  } = config;

  const errorLogger = useRef(ErrorLogger.getInstance());
  const recoveryManager = useRef(ErrorRecoveryManager.getInstance());
  const [errorStats, setErrorStats] = useState<ErrorStats>({
    totalErrors: 0,
    errorsByType: {
      network: 0,
      auth: 0,
      validation: 0,
      ai: 0,
      storage: 0
    },
    errorsBySeverity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    recoverySuccessRate: 0
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    memoryUsage?: number;
    loadTime?: number;
    errorRate?: number;
  }>({});

  // Initialize error monitoring
  useEffect(() => {
    if (userId) {
      errorLogger.current.setUserId(userId);
    }

    // Set up error listener
    const unsubscribe = errorLogger.current.onError((error: AppError) => {
      updateErrorStats(error);
      
      // Attempt auto-recovery if enabled
      if (enableAutoRecovery && error.recoverable) {
        handleAutoRecovery(error);
      }
    });

    return unsubscribe;
  }, [userId, enableAutoRecovery]);

  // Network monitoring
  useEffect(() => {
    if (!enableNetworkMonitoring) return;

    const handleOnline = () => {
      setIsOnline(true);
      logError({
        type: 'network',
        severity: 'low',
        message: 'Network connection restored',
        userMessage: 'Conexión restaurada. Puedes continuar trabajando.',
        recoverable: true,
        retryable: false
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      logError({
        type: 'network',
        severity: 'medium',
        message: 'Network connection lost',
        userMessage: 'Sin conexión a internet. Trabajando en modo offline.',
        recoverable: true,
        retryable: true
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableNetworkMonitoring]);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const monitorPerformance = () => {
      try {
        // Memory usage monitoring
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
          
          setPerformanceMetrics(prev => ({
            ...prev,
            memoryUsage
          }));

          // Alert if memory usage is high
          if (memoryUsage > 0.9) {
            logError({
              type: 'storage',
              severity: 'medium',
              message: 'High memory usage detected',
              userMessage: 'El uso de memoria es alto. Considera recargar la página.',
              recoverable: true,
              retryable: false,
              context: { memoryUsage }
            });
          }
        }

        // Page load time monitoring
        if ('navigation' in performance) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          
          setPerformanceMetrics(prev => ({
            ...prev,
            loadTime
          }));

          // Alert if load time is too high
          if (loadTime > 5000) {
            logError({
              type: 'network',
              severity: 'low',
              message: 'Slow page load detected',
              userMessage: 'La página tardó en cargar. Verifica tu conexión.',
              recoverable: true,
              retryable: false,
              context: { loadTime }
            });
          }
        }
      } catch (error) {
        console.warn('Performance monitoring failed:', error);
      }
    };

    // Monitor performance every 30 seconds
    const interval = setInterval(monitorPerformance, 30000);
    
    // Initial check
    monitorPerformance();

    return () => clearInterval(interval);
  }, [enablePerformanceMonitoring]);

  const updateErrorStats = useCallback((error: AppError) => {
    setErrorStats(prev => ({
      totalErrors: prev.totalErrors + 1,
      errorsByType: {
        ...prev.errorsByType,
        [error.type]: prev.errorsByType[error.type] + 1
      },
      errorsBySeverity: {
        ...prev.errorsBySeverity,
        [error.severity]: prev.errorsBySeverity[error.severity] + 1
      },
      recoverySuccessRate: prev.recoverySuccessRate, // Will be updated by recovery attempts
      lastError: error
    }));
  }, []);

  const handleAutoRecovery = useCallback(async (error: AppError) => {
    try {
      const success = await recoveryManager.current.attemptRecovery(error);
      
      // Update recovery success rate
      setErrorStats(prev => {
        const totalRecoveryAttempts = prev.totalErrors;
        const successfulRecoveries = success ? 1 : 0;
        const newSuccessRate = totalRecoveryAttempts > 0 
          ? ((prev.recoverySuccessRate * (totalRecoveryAttempts - 1)) + successfulRecoveries) / totalRecoveryAttempts
          : successfulRecoveries;
        
        return {
          ...prev,
          recoverySuccessRate: newSuccessRate
        };
      });

      if (success) {
        console.log('Auto-recovery successful for error:', error.id);
      } else {
        console.warn('Auto-recovery failed for error:', error.id);
      }
    } catch (recoveryError) {
      console.error('Auto-recovery error:', recoveryError);
    }
  }, []);

  // Logging functions
  const logError = useCallback((errorData: Partial<AppError>): AppError => {
    return errorLogger.current.logError(errorData);
  }, []);

  const logNetworkError = useCallback((message: string, context?: any): AppError => {
    return logError({
      type: 'network',
      severity: 'medium',
      message,
      userMessage: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
      recoverable: true,
      retryable: true,
      context
    });
  }, [logError]);

  const logAuthError = useCallback((message: string, context?: any): AppError => {
    return logError({
      type: 'auth',
      severity: 'high',
      message,
      userMessage: 'Error de autenticación. Inicia sesión nuevamente.',
      recoverable: true,
      retryable: false,
      context
    });
  }, [logError]);

  const logValidationError = useCallback((message: string, context?: any): AppError => {
    return logError({
      type: 'validation',
      severity: 'medium',
      message,
      userMessage: 'Datos inválidos. Revisa la información e intenta de nuevo.',
      recoverable: true,
      retryable: false,
      context
    });
  }, [logError]);

  const logAIError = useCallback((message: string, context?: any): AppError => {
    return logError({
      type: 'ai',
      severity: 'medium',
      message,
      userMessage: 'Error en el servicio de IA. Intenta de nuevo en unos momentos.',
      recoverable: true,
      retryable: true,
      context
    });
  }, [logError]);

  const logStorageError = useCallback((message: string, context?: any): AppError => {
    return logError({
      type: 'storage',
      severity: 'medium',
      message,
      userMessage: 'Error al guardar. Verifica el espacio disponible.',
      recoverable: true,
      retryable: true,
      context
    });
  }, [logError]);

  // Retry wrapper with error logging
  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    retries: number = maxRetries
  ): Promise<T> => {
    try {
      return await recoveryManager.current.retryWithExponentialBackoff(operation, {
        maxRetries: retries
      });
    } catch (error) {
      const appError = logError({
        type: 'network',
        severity: 'medium',
        message: `Operation failed after ${retries} retries: ${operationName}`,
        userMessage: `No se pudo completar: ${operationName}. Intenta de nuevo más tarde.`,
        recoverable: true,
        retryable: true,
        context: { operationName, retries, error: error instanceof Error ? error.message : error }
      });
      
      throw appError;
    }
  }, [maxRetries, logError]);

  // Safe async operation wrapper
  const safeAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    fallback?: T
  ): Promise<T | undefined> => {
    try {
      return await operation();
    } catch (error) {
      logError({
        type: 'validation',
        severity: 'low',
        message: `Safe operation failed: ${operationName}`,
        userMessage: `Error en: ${operationName}`,
        recoverable: true,
        retryable: false,
        context: { operationName, error: error instanceof Error ? error.message : error }
      });
      
      return fallback;
    }
  }, [logError]);

  // Get error history
  const getErrorHistory = useCallback(() => {
    return errorLogger.current.getErrorHistory();
  }, []);

  // Clear error logs
  const clearErrorLogs = useCallback(() => {
    errorLogger.current.clearErrorLogs();
    setErrorStats({
      totalErrors: 0,
      errorsByType: {
        network: 0,
        auth: 0,
        validation: 0,
        ai: 0,
        storage: 0
      },
      errorsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      recoverySuccessRate: 0
    });
  }, []);

  // Export error logs
  const exportErrorLogs = useCallback(() => {
    return errorLogger.current.exportErrorLogs();
  }, []);

  return {
    // Error logging functions
    logError,
    logNetworkError,
    logAuthError,
    logValidationError,
    logAIError,
    logStorageError,
    
    // Operation wrappers
    retryOperation,
    safeAsyncOperation,
    
    // Error management
    getErrorHistory,
    clearErrorLogs,
    exportErrorLogs,
    
    // Status and metrics
    errorStats,
    isOnline,
    performanceMetrics,
    
    // Recovery
    attemptRecovery: (error: AppError) => recoveryManager.current.attemptRecovery(error),
    isRecoveryInProgress: (errorId: string) => recoveryManager.current.isRecoveryInProgress(errorId)
  };
};

export default useErrorMonitoring;