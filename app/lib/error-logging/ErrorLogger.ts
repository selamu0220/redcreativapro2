/**
 * Centralized Error Logging Service for AI Writer
 * Handles error categorization, logging, and recovery mechanisms
 */

export type ErrorType = 'network' | 'auth' | 'validation' | 'ai' | 'storage';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  context?: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryAction {
  id: string;
  label: string;
  action: () => Promise<void> | void;
  primary?: boolean;
}

export interface ErrorLogEntry {
  error: AppError;
  recoveryAttempts: number;
  resolved: boolean;
  resolvedAt?: Date;
  userActions: string[];
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorLog: Map<string, ErrorLogEntry> = new Map();
  private errorListeners: ((error: AppError) => void)[] = [];
  private sessionId: string;
  private userId?: string;
  private maxLogEntries = 1000;
  private retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorHandling();
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private initializeErrorHandling(): void {
    // Global error handler for unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'validation',
        severity: 'high',
        message: `Unhandled error: ${event.error?.message || event.message}`,
        userMessage: 'Se produjo un error inesperado. Por favor, recarga la página.',
        recoverable: true,
        retryable: false,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        stackTrace: event.error?.stack
      });
    });

    // Global promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'network',
        severity: 'medium',
        message: `Unhandled promise rejection: ${event.reason}`,
        userMessage: 'Error de conexión. Verificando conexión...',
        recoverable: true,
        retryable: true,
        context: { reason: event.reason }
      });
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public logError(errorData: Partial<AppError>): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      type: errorData.type || 'validation',
      severity: errorData.severity || 'medium',
      message: errorData.message || 'Unknown error',
      userMessage: errorData.userMessage || this.getDefaultUserMessage(errorData.type || 'validation'),
      recoverable: errorData.recoverable ?? true,
      retryable: errorData.retryable ?? false,
      context: errorData.context,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      stackTrace: errorData.stackTrace || new Error().stack,
      metadata: errorData.metadata
    };

    // Store in error log
    const logEntry: ErrorLogEntry = {
      error,
      recoveryAttempts: 0,
      resolved: false,
      userActions: []
    };

    this.errorLog.set(error.id, logEntry);
    this.cleanupOldEntries();

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${error.type}] - ${error.severity}`);
      console.error('Message:', error.message);
      console.error('User Message:', error.userMessage);
      console.error('Context:', error.context);
      console.error('Stack:', error.stackTrace);
      console.groupEnd();
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(error);
    }

    return error;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages = {
      network: 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
      auth: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
      validation: 'Los datos ingresados no son válidos. Revisa la información e intenta de nuevo.',
      ai: 'Error en el servicio de IA. Intenta de nuevo en unos momentos.',
      storage: 'Error al guardar los datos. Verifica el espacio disponible e intenta de nuevo.'
    };
    return messages[type];
  }

  public async retryOperation<T>(
    operation: () => Promise<T>,
    errorId?: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Mark error as resolved if provided
        if (errorId) {
          this.markErrorResolved(errorId);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (errorId) {
          this.incrementRetryAttempt(errorId);
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  public getRecoveryActions(error: AppError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    switch (error.type) {
      case 'network':
        actions.push(
          {
            id: 'retry',
            label: 'Reintentar',
            action: () => window.location.reload(),
            primary: true
          },
          {
            id: 'check_connection',
            label: 'Verificar conexión',
            action: () => {
              window.open('https://www.google.com', '_blank');
            }
          }
        );
        break;

      case 'auth':
        actions.push(
          {
            id: 'login',
            label: 'Iniciar sesión',
            action: () => {
              window.location.href = '/auth/login';
            },
            primary: true
          },
          {
            id: 'refresh_token',
            label: 'Actualizar sesión',
            action: async () => {
              try {
                await fetch('/api/auth/refresh', { method: 'POST' });
                window.location.reload();
              } catch (e) {
                console.error('Failed to refresh token:', e);
              }
            }
          }
        );
        break;

      case 'ai':
        actions.push(
          {
            id: 'retry_ai',
            label: 'Reintentar con IA',
            action: () => {
              // This will be handled by the component
            },
            primary: true
          },
          {
            id: 'check_api_key',
            label: 'Verificar API Key',
            action: () => {
              // Navigate to settings
              window.location.href = '/ajustes';
            }
          }
        );
        break;

      case 'storage':
        actions.push(
          {
            id: 'clear_cache',
            label: 'Limpiar caché',
            action: () => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }
          },
          {
            id: 'download_backup',
            label: 'Descargar respaldo',
            action: () => {
              // This will be handled by the component
            },
            primary: true
          }
        );
        break;

      case 'validation':
        actions.push(
          {
            id: 'reset_form',
            label: 'Restablecer formulario',
            action: () => {
              // This will be handled by the component
            },
            primary: true
          }
        );
        break;
    }

    return actions;
  }

  public onError(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  public getErrorHistory(): ErrorLogEntry[] {
    return Array.from(this.errorLog.values()).sort(
      (a, b) => b.error.timestamp.getTime() - a.error.timestamp.getTime()
    );
  }

  public getErrorById(id: string): ErrorLogEntry | undefined {
    return this.errorLog.get(id);
  }

  public markErrorResolved(errorId: string): void {
    const entry = this.errorLog.get(errorId);
    if (entry) {
      entry.resolved = true;
      entry.resolvedAt = new Date();
    }
  }

  public addUserAction(errorId: string, action: string): void {
    const entry = this.errorLog.get(errorId);
    if (entry) {
      entry.userActions.push(`${new Date().toISOString()}: ${action}`);
    }
  }

  private incrementRetryAttempt(errorId: string): void {
    const entry = this.errorLog.get(errorId);
    if (entry) {
      entry.recoveryAttempts++;
    }
  }

  private cleanupOldEntries(): void {
    if (this.errorLog.size > this.maxLogEntries) {
      const entries = Array.from(this.errorLog.entries()).sort(
        (a, b) => a[1].error.timestamp.getTime() - b[1].error.timestamp.getTime()
      );
      
      const toRemove = entries.slice(0, entries.length - this.maxLogEntries);
      toRemove.forEach(([id]) => this.errorLog.delete(id));
    }
  }

  private async sendToExternalLogger(error: AppError): Promise<void> {
    try {
      // In a real implementation, you would send to your logging service
      // For now, we'll just store in localStorage as a backup
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push({
        ...error,
        timestamp: error.timestamp.toISOString()
      });
      
      // Keep only last 100 errors in localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  public exportErrorLogs(): string {
    const logs = this.getErrorHistory();
    return JSON.stringify(logs, null, 2);
  }

  public clearErrorLogs(): void {
    this.errorLog.clear();
    localStorage.removeItem('error_logs');
  }
}

export default ErrorLogger;