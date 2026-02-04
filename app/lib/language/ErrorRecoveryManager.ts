import { LanguageCode, DEFAULT_LANGUAGE, TranslationNamespace } from './config';
import { ErrorType, RecoveryStrategy, ErrorContext, TranslationData } from './types';

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: number }> = [];
  private fallbackTranslations: Record<string, TranslationData> = {};
  private retryAttempts: Map<string, number> = new Map();
  private maxRetryAttempts = 3;
  private retryBackoffMs = 1000;

  private constructor() {}

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Handle translation loading errors with appropriate recovery strategy
   */
  handleTranslationError(error: Error, namespace: string, language: string): RecoveryStrategy {
    const context: ErrorContext = {
      component: 'LanguageProvider',
      action: 'loadTranslations',
      language,
      namespace,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: Date.now(),
      stackTrace: error.stack
    };

    this.logError(error, context);

    // Enhanced error categorization and recovery strategies
    const errorType = this.categorizeError(error);
    const retryKey = `${language}-${namespace}`;
    const currentRetries = this.retryAttempts.get(retryKey) || 0;

    switch (errorType) {
      case ErrorType.TRANSLATION_LOADING_FAILED:
        if (error.message.includes('Network') && currentRetries < this.maxRetryAttempts) {
          this.retryAttempts.set(retryKey, currentRetries + 1);
          return RecoveryStrategy.RETRY_WITH_BACKOFF;
        }
        
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return language === DEFAULT_LANGUAGE 
            ? RecoveryStrategy.ENABLE_FALLBACK_MODE 
            : RecoveryStrategy.USE_DEFAULT_LANGUAGE;
        }

        if (error.message.includes('timeout')) {
          return RecoveryStrategy.USE_FALLBACK_TRANSLATIONS;
        }

        // For malformed JSON or parsing errors
        if (error.message.includes('JSON') || error.message.includes('parse')) {
          console.warn(`Malformed translation file detected for ${language}/${namespace}. Using fallback.`);
          return RecoveryStrategy.USE_FALLBACK_TRANSLATIONS;
        }

        return RecoveryStrategy.USE_FALLBACK_TRANSLATIONS;

      default:
        return RecoveryStrategy.USE_FALLBACK_TRANSLATIONS;
    }
  }

  /**
   * Categorize error type based on error message and context
   */
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorType.TRANSLATION_LOADING_FAILED;
    }
    
    if (message.includes('hydration') || message.includes('mismatch')) {
      return ErrorType.SSR_HYDRATION_MISMATCH;
    }
    
    if (message.includes('route') || message.includes('navigation')) {
      return ErrorType.ROUTING_ERROR;
    }
    
    if (message.includes('context') || message.includes('initialization')) {
      return ErrorType.CONTEXT_INITIALIZATION_FAILED;
    }
    
    return ErrorType.TRANSLATION_LOADING_FAILED; // Default fallback
  }

  /**
   * Handle context initialization errors
   */
  handleContextInitializationError(error: Error): RecoveryStrategy {
    const context: ErrorContext = {
      component: 'LanguageProvider',
      action: 'initializeLanguage',
      language: DEFAULT_LANGUAGE,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: Date.now(),
      stackTrace: error.stack
    };

    this.logError(error, context);

    // Enhanced initialization error handling
    console.warn('Language context initialization failed, enabling fallback mode:', error.message);
    
    // For initialization errors, always enable fallback mode to prevent complete page failure
    return RecoveryStrategy.ENABLE_FALLBACK_MODE;
  }

  /**
   * Handle SSR-related errors
   */
  handleSSRError(error: Error): RecoveryStrategy {
    const context: ErrorContext = {
      component: 'LanguageProvider',
      action: 'SSR',
      language: DEFAULT_LANGUAGE,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      timestamp: Date.now(),
      stackTrace: error.stack
    };

    this.logError(error, context);

    // Enhanced SSR error logging for debugging
    console.error('SSR Error Details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      isServer: typeof window === 'undefined'
    });

    // For SSR errors, use fallback mode to ensure the app still works
    return RecoveryStrategy.ENABLE_FALLBACK_MODE;
  }

  /**
   * Handle routing errors with fallback page redirection
   */
  handleRoutingError(error: Error, currentPath: string): RecoveryStrategy {
    const context: ErrorContext = {
      component: 'I18nRouter',
      action: 'routeNavigation',
      language: DEFAULT_LANGUAGE,
      url: currentPath,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: Date.now(),
      stackTrace: error.stack
    };

    this.logError(error, context);

    console.warn(`Routing error on path ${currentPath}, preparing fallback redirect:`, error.message);
    
    // Return strategy to redirect to fallback page
    return RecoveryStrategy.USE_DEFAULT_LANGUAGE;
  }

  /**
   * Get recovery strategy for a specific error type
   */
  getRecoveryStrategy(errorType: ErrorType): RecoveryStrategy {
    switch (errorType) {
      case ErrorType.TRANSLATION_LOADING_FAILED:
        return RecoveryStrategy.USE_FALLBACK_TRANSLATIONS;
      case ErrorType.CONTEXT_INITIALIZATION_FAILED:
        return RecoveryStrategy.ENABLE_FALLBACK_MODE;
      case ErrorType.SSR_HYDRATION_MISMATCH:
        return RecoveryStrategy.USE_DEFAULT_LANGUAGE;
      case ErrorType.ROUTING_ERROR:
        return RecoveryStrategy.USE_DEFAULT_LANGUAGE;
      default:
        return RecoveryStrategy.ENABLE_FALLBACK_MODE;
    }
  }

  /**
   * Log error with context information
   */
  logError(error: Error, context: ErrorContext): void {
    const logEntry = {
      error,
      context,
      timestamp: Date.now()
    };

    this.errorLog.push(logEntry);

    // Keep only last 50 errors to prevent memory leaks
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }

    // Enhanced logging with more detailed information
    const errorDetails = {
      message: error.message,
      name: error.name,
      component: context.component,
      action: context.action,
      language: context.language,
      namespace: context.namespace,
      url: context.url,
      timestamp: new Date(context.timestamp).toISOString(),
      stack: error.stack,
      userAgent: context.userAgent,
      errorType: this.categorizeError(error)
    };

    console.error('🚨 Language Context Error:', errorDetails);

    // Enhanced production error tracking
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Send structured error data to error tracking service
      try {
        // Example: Send to error tracking service with more context
        const errorPayload = {
          ...errorDetails,
          severity: this.getErrorSeverity(error),
          recoveryStrategy: this.getRecoveryStrategy(this.categorizeError(error)),
          sessionId: this.getSessionId(),
          buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown'
        };
        
        // In a real implementation, you would send this to your error tracking service
        console.log('Error tracking payload:', errorPayload);
      } catch (trackingError) {
        console.warn('Failed to send error to tracking service:', trackingError);
      }
    }
  }

  /**
   * Get error severity level for prioritization
   */
  private getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'medium';
    }
    
    if (message.includes('404') || message.includes('not found')) {
      return 'high';
    }
    
    if (message.includes('initialization') || message.includes('context')) {
      return 'critical';
    }
    
    return 'low';
  }

  /**
   * Get or generate session ID for error tracking
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get fallback translations for a specific language and namespace
   */
  getFallbackTranslations(language: LanguageCode, namespace: TranslationNamespace): TranslationData | null {
    const key = `${language}-${namespace}`;
    return this.fallbackTranslations[key] || null;
  }

  /**
   * Set fallback translations for caching
   */
  setFallbackTranslations(language: LanguageCode, namespace: TranslationNamespace, data: TranslationData): void {
    const key = `${language}-${namespace}`;
    this.fallbackTranslations[key] = data;
  }

  /**
   * Clear all cached fallback translations
   */
  clearFallbackTranslations(): void {
    this.fallbackTranslations = {};
  }

  /**
   * Reset retry attempts for a specific language-namespace combination
   */
  resetRetryAttempts(language: string, namespace: string): void {
    const retryKey = `${language}-${namespace}`;
    this.retryAttempts.delete(retryKey);
  }

  /**
   * Get retry delay based on attempt count (exponential backoff)
   */
  getRetryDelay(attemptCount: number): number {
    return Math.min(this.retryBackoffMs * Math.pow(2, attemptCount), 10000); // Max 10 seconds
  }

  /**
   * Check if retry should be attempted for a specific error
   */
  shouldRetry(error: Error, language: string, namespace: string): boolean {
    const retryKey = `${language}-${namespace}`;
    const currentRetries = this.retryAttempts.get(retryKey) || 0;
    
    // Don't retry for certain error types
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return false;
    }
    
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return false;
    }
    
    return currentRetries < this.maxRetryAttempts;
  }

  /**
   * Handle hydration mismatch errors specifically
   */
  handleHydrationError(error: Error, serverState: any, clientState: any): RecoveryStrategy {
    const context: ErrorContext = {
      component: 'LanguageProvider',
      action: 'hydration',
      language: DEFAULT_LANGUAGE,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: Date.now(),
      stackTrace: error.stack
    };

    this.logError(error, context);

    console.warn('Hydration mismatch detected:', {
      serverState: JSON.stringify(serverState, null, 2),
      clientState: JSON.stringify(clientState, null, 2),
      error: error.message
    });

    // For hydration errors, re-initialize on client side
    return RecoveryStrategy.USE_DEFAULT_LANGUAGE;
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats(): {
    totalErrors: number;
    recentErrors: number;
    errorsByType: Record<string, number>;
    errorsByLanguage: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    retryStats: Record<string, number>;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentErrors = this.errorLog.filter(entry => entry.timestamp > oneHourAgo);
    
    const errorsByType: Record<string, number> = {};
    const errorsByLanguage: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorLog.forEach(entry => {
      const errorType = this.categorizeError(entry.error);
      const severity = this.getErrorSeverity(entry.error);
      
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      errorsByLanguage[entry.context.language] = (errorsByLanguage[entry.context.language] || 0) + 1;
      errorsBySeverity[severity] = (errorsBySeverity[severity] || 0) + 1;
    });

    const retryStats: Record<string, number> = {};
    this.retryAttempts.forEach((count, key) => {
      retryStats[key] = count;
    });

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      errorsByType,
      errorsByLanguage,
      errorsBySeverity,
      retryStats
    };
  }

  /**
   * Get health status of the error recovery system
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.getErrorStats();
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for high error rates
    if (stats.recentErrors > 10) {
      issues.push(`High error rate: ${stats.recentErrors} errors in the last hour`);
      recommendations.push('Check network connectivity and server status');
    }
    
    // Check for critical errors
    if (stats.errorsBySeverity.critical > 0) {
      issues.push(`${stats.errorsBySeverity.critical} critical errors detected`);
      recommendations.push('Review critical errors immediately');
    }
    
    // Check for excessive retries
    const totalRetries = Object.values(stats.retryStats).reduce((sum, count) => sum + count, 0);
    if (totalRetries > 20) {
      issues.push(`High retry count: ${totalRetries} total retry attempts`);
      recommendations.push('Check translation file availability and network stability');
    }
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = stats.errorsBySeverity.critical > 0 ? 'critical' : 'warning';
    }
    
    return {
      status,
      issues,
      recommendations
    };
  }
}
