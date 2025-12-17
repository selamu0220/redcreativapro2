/**
 * Error Recovery Manager
 * Handles automatic error recovery, retry logic, and fallback mechanisms
 */

import ErrorLogger, { AppError, ErrorType } from './ErrorLogger';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  canRecover: (error: AppError) => boolean;
  recover: (error: AppError, context?: any) => Promise<boolean>;
  priority: number;
}

export interface RecoveryContext {
  userAction?: string;
  componentState?: any;
  retryCount?: number;
  lastSuccessfulOperation?: Date;
}

class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorLogger: ErrorLogger;
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private activeRecoveries: Map<string, Promise<boolean>> = new Map();
  
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ['network', 'ai', 'storage']
  };

  private constructor() {
    this.errorLogger = ErrorLogger.getInstance();
    this.initializeRecoveryStrategies();
  }

  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  private initializeRecoveryStrategies(): void {
    // Network error recovery
    this.registerRecoveryStrategy({
      id: 'network_retry',
      name: 'Network Retry',
      description: 'Retry network operations with exponential backoff',
      priority: 1,
      canRecover: (error) => error.type === 'network' && error.retryable,
      recover: async (error, context) => {
        return this.retryNetworkOperation(error, context);
      }
    });

    // Authentication error recovery
    this.registerRecoveryStrategy({
      id: 'auth_refresh',
      name: 'Authentication Refresh',
      description: 'Refresh authentication tokens',
      priority: 2,
      canRecover: (error) => error.type === 'auth' && error.message.includes('token'),
      recover: async (error) => {
        return this.refreshAuthentication(error);
      }
    });

    // AI service error recovery
    this.registerRecoveryStrategy({
      id: 'ai_fallback',
      name: 'AI Service Fallback',
      description: 'Switch to fallback AI model or service',
      priority: 3,
      canRecover: (error) => error.type === 'ai' && error.retryable,
      recover: async (error, context) => {
        return this.handleAIServiceFallback(error, context);
      }
    });

    // Storage error recovery
    this.registerRecoveryStrategy({
      id: 'storage_cleanup',
      name: 'Storage Cleanup',
      description: 'Clean up storage and retry operation',
      priority: 4,
      canRecover: (error) => error.type === 'storage' && error.message.includes('quota'),
      recover: async (error) => {
        return this.cleanupStorage(error);
      }
    });

    // Validation error recovery
    this.registerRecoveryStrategy({
      id: 'validation_sanitize',
      name: 'Data Sanitization',
      description: 'Sanitize and validate data before retry',
      priority: 5,
      canRecover: (error) => error.type === 'validation' && error.recoverable,
      recover: async (error, context) => {
        return this.sanitizeAndRetry(error, context);
      }
    });
  }

  public registerRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.id, strategy);
  }

  public async attemptRecovery(
    error: AppError, 
    context?: RecoveryContext
  ): Promise<boolean> {
    // Check if recovery is already in progress for this error
    if (this.activeRecoveries.has(error.id)) {
      return this.activeRecoveries.get(error.id)!;
    }

    const recoveryPromise = this.executeRecovery(error, context);
    this.activeRecoveries.set(error.id, recoveryPromise);

    try {
      const result = await recoveryPromise;
      this.activeRecoveries.delete(error.id);
      return result;
    } catch (recoveryError) {
      this.activeRecoveries.delete(error.id);
      console.error('Recovery failed:', recoveryError);
      return false;
    }
  }

  private async executeRecovery(
    error: AppError, 
    context?: RecoveryContext
  ): Promise<boolean> {
    // Get applicable recovery strategies
    const strategies = Array.from(this.recoveryStrategies.values())
      .filter(strategy => strategy.canRecover(error))
      .sort((a, b) => a.priority - b.priority);

    if (strategies.length === 0) {
      console.warn('No recovery strategies available for error:', error);
      return false;
    }

    // Try each strategy in order of priority
    for (const strategy of strategies) {
      try {
        console.log(`Attempting recovery with strategy: ${strategy.name}`);
        
        this.errorLogger.addUserAction(
          error.id, 
          `Attempting recovery: ${strategy.name}`
        );

        const success = await strategy.recover(error, context);
        
        if (success) {
          console.log(`Recovery successful with strategy: ${strategy.name}`);
          this.errorLogger.addUserAction(
            error.id, 
            `Recovery successful: ${strategy.name}`
          );
          this.errorLogger.markErrorResolved(error.id);
          return true;
        }
      } catch (strategyError) {
        console.error(`Recovery strategy ${strategy.name} failed:`, strategyError);
        this.errorLogger.addUserAction(
          error.id, 
          `Recovery failed: ${strategy.name} - ${strategyError}`
        );
      }
    }

    return false;
  }

  private async retryNetworkOperation(
    error: AppError, 
    context?: RecoveryContext
  ): Promise<boolean> {
    const retryCount = context?.retryCount || 0;
    
    if (retryCount >= this.defaultRetryConfig.maxRetries) {
      return false;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.defaultRetryConfig.baseDelay * Math.pow(this.defaultRetryConfig.backoffMultiplier, retryCount),
      this.defaultRetryConfig.maxDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));

    // Check network connectivity
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        return true;
      }
    } catch (e) {
      // Network still unavailable, will retry
    }

    return false;
  }

  private async refreshAuthentication(error: AppError): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Token refreshed successfully
        return true;
      } else if (response.status === 401) {
        // Refresh token is also invalid, redirect to login
        window.location.href = '/auth/login';
        return false;
      }
    } catch (e) {
      console.error('Failed to refresh authentication:', e);
    }

    return false;
  }

  private async handleAIServiceFallback(
    error: AppError, 
    context?: RecoveryContext
  ): Promise<boolean> {
    try {
      // Get current AI model from localStorage
      const currentModel = localStorage.getItem('openrouter_model') || 'openai/gpt-4o';
      
      // Define fallback models in order of preference
      const fallbackModels = [
        'openai/gpt-4o-mini',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-pro-1.5',
        'meta-llama/llama-3.1-8b-instruct'
      ].filter(model => model !== currentModel);

      if (fallbackModels.length === 0) {
        return false;
      }

      // Try the first fallback model
      const fallbackModel = fallbackModels[0];
      localStorage.setItem('openrouter_model', fallbackModel);
      localStorage.setItem('ai_model_fallback_active', 'true');
      localStorage.setItem('ai_model_original', currentModel);

      console.log(`Switched to fallback AI model: ${fallbackModel}`);
      
      // Show user notification about fallback
      this.showFallbackNotification(currentModel, fallbackModel);
      
      return true;
    } catch (e) {
      console.error('AI fallback failed:', e);
      return false;
    }
  }

  private async cleanupStorage(error: AppError): Promise<boolean> {
    try {
      // Calculate current storage usage
      const storageEstimate = await navigator.storage?.estimate?.();
      const usedBytes = storageEstimate?.usage || 0;
      const quotaBytes = storageEstimate?.quota || 0;
      
      if (usedBytes / quotaBytes > 0.9) {
        // Storage is nearly full, clean up old data
        this.cleanupOldData();
        return true;
      }

      // Try to clear some cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('old') || cacheName.includes('temp')) {
            await caches.delete(cacheName);
          }
        }
      }

      return true;
    } catch (e) {
      console.error('Storage cleanup failed:', e);
      return false;
    }
  }

  private cleanupOldData(): void {
    try {
      // Remove old error logs
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      if (errorLogs.length > 50) {
        const recentLogs = errorLogs.slice(-50);
        localStorage.setItem('error_logs', JSON.stringify(recentLogs));
      }

      // Remove old document backups
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter(key => 
        key.startsWith('document_backup_') || 
        key.startsWith('ai_writer_backup_')
      );
      
      // Keep only the 10 most recent backups
      if (backupKeys.length > 10) {
        const oldBackups = backupKeys.slice(0, -10);
        oldBackups.forEach(key => localStorage.removeItem(key));
      }

      console.log('Storage cleanup completed');
    } catch (e) {
      console.error('Failed to cleanup old data:', e);
    }
  }

  private async sanitizeAndRetry(
    error: AppError, 
    context?: RecoveryContext
  ): Promise<boolean> {
    try {
      // Basic data sanitization strategies
      if (error.context?.data) {
        const sanitizedData = this.sanitizeData(error.context.data);
        
        // Store sanitized data for retry
        if (context?.componentState) {
          context.componentState.sanitizedData = sanitizedData;
        }
        
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Data sanitization failed:', e);
      return false;
    }
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Remove potentially problematic characters
      return data
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Keep printable ASCII and Unicode
        .trim();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  private showFallbackNotification(originalModel: string, fallbackModel: string): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <p class="font-semibold">Modelo de IA cambiado</p>
          <p class="text-sm">Cambiado a ${fallbackModel} debido a un error</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  public async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const finalConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === finalConfig.maxRetries) {
          break;
        }

        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelay
        );

        console.log(`Retry attempt ${attempt + 1}/${finalConfig.maxRetries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  public getRecoveryStrategies(): RecoveryStrategy[] {
    return Array.from(this.recoveryStrategies.values());
  }

  public isRecoveryInProgress(errorId: string): boolean {
    return this.activeRecoveries.has(errorId);
  }
}

export default ErrorRecoveryManager;