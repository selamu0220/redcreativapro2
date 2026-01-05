/**
 * Error Handling and Recovery Service
 * 
 * Implements robust error handling with:
 * - Exponential backoff for API retries
 * - Offline queue for suggestions
 * - Clear error messages with retry options
 * - Fallback to simpler models
 * - Graceful degradation
 * 
 * Requirement: Error handling scenarios
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
    operation: string;
    timestamp: Date;
    severity: ErrorSeverity;
    retryable: boolean;
    userMessage: string;
    technicalDetails?: string;
    suggestedAction?: string;
}

export interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
};

/**
 * Error types that can occur in the system
 */
export class AIWriterError extends Error {
    constructor(
        message: string,
        public severity: ErrorSeverity,
        public retryable: boolean = false,
        public context?: Record<string, any>
    ) {
        super(message);
        this.name = 'AIWriterError';
    }
}

export class NetworkError extends AIWriterError {
    constructor(message: string = 'Network error occurred', context?: Record<string, any>) {
        super(message, 'medium', true, context);
        this.name = 'NetworkError';
    }
}

export class RateLimitError extends AIWriterError {
    constructor(
        message: string = 'Rate limit exceeded',
        public retryAfterMs?: number,
        context?: Record<string, any>
    ) {
        super(message, 'medium', true, context);
        this.name = 'RateLimitError';
    }
}

export class AIServiceError extends AIWriterError {
    constructor(message: string = 'AI service error', context?: Record<string, any>) {
        super(message, 'high', true, context);
        this.name = 'AIServiceError';
    }
}

export class ValidationError extends AIWriterError {
    constructor(message: string = 'Validation error', context?: Record<string, any>) {
        super(message, 'low', false, context);
        this.name = 'ValidationError';
    }
}

/**
 * Service for handling errors and implementing retry logic
 */
export class ErrorHandlingService {
    private retryConfig: RetryConfig;
    private errorLog: ErrorContext[];
    private offlineQueue: Array<{
        operation: () => Promise<any>;
        timestamp: Date;
    }>;

    constructor(config: Partial<RetryConfig> = {}) {
        this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
        this.errorLog = [];
        this.offlineQueue = [];

        // Monitor online/offline status
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.processOfflineQueue());
            window.addEventListener('offline', () => this.handleOffline());
        }
    }

    /**
     * Execute operation with automatic retry and exponential backoff
     */
    async executeWithRetry<T>(
        operation: () => Promise<T>,
        operationName: string = 'Unknown',
        retryConfig?: Partial<RetryConfig>
    ): Promise<T> {
        const config = { ...this.retryConfig, ...retryConfig };
        let lastError: Error | null = null;
        let attempt = 0;

        while (attempt <= config.maxRetries) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                attempt++;

                // Log error
                this.logError({
                    operation: operationName,
                    timestamp: new Date(),
                    severity: this.getErrorSeverity(error),
                    retryable: this.isRetryable(error),
                    userMessage: this.getUserMessage(error),
                    technicalDetails: error instanceof Error ? error.message : String(error),
                });

                // Don't retry if not retryable or max retries reached
                if (!this.isRetryable(error) || attempt > config.maxRetries) {
                    throw error;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
                    config.maxDelayMs
                );

                // Handle rate limit specially
                if (error instanceof RateLimitError && error.retryAfterMs) {
                    await this.sleep(error.retryAfterMs);
                } else {
                    await this.sleep(delay);
                }

                console.log(
                    `[Retry] Attempt ${attempt}/${config.maxRetries} for ${operationName} after ${delay}ms`
                );
            }
        }

        throw lastError;
    }

    /**
     * Execute operation with fallback
     */
    async executeWithFallback<T>(
        primaryOperation: () => Promise<T>,
        fallbackOperation: () => Promise<T>,
        operationName: string = 'Unknown'
    ): Promise<T> {
        try {
            return await this.executeWithRetry(primaryOperation, operationName, {
                maxRetries: 2, // Fewer retries before falling back
            });
        } catch (error) {
            console.log(`[Fallback] Primary operation failed, trying fallback for ${operationName}`);

            try {
                return await fallbackOperation();
            } catch (fallbackError) {
                // Both failed, throw original error
                throw error;
            }
        }
    }

    /**
     * Queue operation for when online
     */
    queueForOffline(operation: () => Promise<any>): void {
        this.offlineQueue.push({
            operation,
            timestamp: new Date(),
        });

        console.log(`[Offline Queue] Added operation. Queue size: ${this.offlineQueue.length}`);
    }

    /**
     * Process queued operations when back online
     */
    private async processOfflineQueue(): Promise<void> {
        console.log(`[Online] Processing ${this.offlineQueue.length} queued operations`);

        while (this.offlineQueue.length > 0) {
            const item = this.offlineQueue.shift();
            if (!item) continue;

            try {
                await item.operation();
            } catch (error) {
                console.error('[Offline Queue] Failed to process queued operation:', error);
                // Re-queue if still offline
                if (!navigator.onLine) {
                    this.offlineQueue.unshift(item);
                    break;
                }
            }
        }
    }

    /**
     * Handle offline state
     */
    private handleOffline(): void {
        console.log('[Offline] Application is offline. Queueing operations.');
    }

    /**
     * Determine if error is retryable
     */
    private isRetryable(error: unknown): boolean {
        if (error instanceof AIWriterError) {
            return error.retryable;
        }

        // Network errors are retryable
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return true;
        }

        // 5xx errors are retryable
        if (error instanceof Response && error.status >= 500 && error.status < 600) {
            return true;
        }

        // 429 rate limit is retryable
        if (error instanceof Response && error.status === 429) {
            return true;
        }

        return false;
    }

    /**
     * Get error severity
     */
    private getErrorSeverity(error: unknown): ErrorSeverity {
        if (error instanceof AIWriterError) {
            return error.severity;
        }

        if (error instanceof TypeError) {
            return 'medium';
        }

        if (error instanceof Response) {
            if (error.status >= 500) return 'high';
            if (error.status >= 400) return 'medium';
        }

        return 'medium';
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(error: unknown): string {
        if (error instanceof RateLimitError) {
            return 'Has alcanzado el límite de solicitudes. Por favor, espera un momento e intenta de nuevo.';
        }

        if (error instanceof NetworkError) {
            return 'Problema de conexión detectado. Verifica tu conexión a internet.';
        }

        if (error instanceof AIServiceError) {
            return 'El servicio de IA está temporalmente no disponible. Intenta de nuevo en unos momentos.';
        }

        if (error instanceof ValidationError) {
            return error.message;
        }

        if (!navigator.onLine) {
            return 'No hay conexión a internet. Los cambios se guardarán cuando vuelvas a estar online.';
        }

        return 'Ha ocurrido un error inesperado. Intenta de nuevo.';
    }

    /**
     * Get suggested action for error
     */
    getSuggestedAction(error: unknown): string {
        if (error instanceof RateLimitError) {
            return 'Espera unos minutos antes de continuar.';
        }

        if (error instanceof NetworkError || !navigator.onLine) {
            return 'Verifica tu conexión a internet y recarga la página.';
        }

        if (error instanceof AIServiceError) {
            return 'Si el problema persiste, contacta con soporte.';
        }

        if (this.isRetryable(error)) {
            return 'Haz clic en "Reintentar" para intentar de nuevo.';
        }

        return 'Recarga la página e intenta de nuevo.';
    }

    /**
     * Log error for debugging
     */
    private logError(context: ErrorContext): void {
        this.errorLog.push(context);

        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog.shift();
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('[Error]', context);
        }
    }

    /**
     * Get error log
     */
    getErrorLog(): ErrorContext[] {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    clearErrorLog(): void {
        this.errorLog = [];
    }

    /**
     * Get error statistics
     */
    getErrorStats(): {
        totalErrors: number;
        byServerity: Record<ErrorSeverity, number>;
        retryableCount: number;
        recentErrors: ErrorContext[];
    } {
        const bySeverity: Record<ErrorSeverity, number> = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
        };

        let retryableCount = 0;

        this.errorLog.forEach(error => {
            bySeverity[error.severity]++;
            if (error.retryable) retryableCount++;
        });

        return {
            totalErrors: this.errorLog.length,
            byServerity: bySeverity,
            retryableCount,
            recentErrors: this.errorLog.slice(-10),
        };
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if online
     */
    isOnline(): boolean {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    /**
     * Format error for display
     */
    formatErrorForDisplay(error: unknown): {
        title: string;
        message: string;
        action: string;
        severity: ErrorSeverity;
        canRetry: boolean;
    } {
        const userMessage = this.getUserMessage(error);
        const suggestedAction = this.getSuggestedAction(error);
        const severity = this.getErrorSeverity(error);
        const canRetry = this.isRetryable(error);

        let title = '¡Oops!';
        if (severity === 'critical') title = 'Error Crítico';
        else if (severity === 'high') title = 'Error';
        else if (severity === 'low') title = 'Atención';

        return {
            title,
            message: userMessage,
            action: suggestedAction,
            severity,
            canRetry,
        };
    }
}

/**
 * Create singleton instance
 */
let globalErrorService: ErrorHandlingService | null = null;

export function getErrorService(config?: Partial<RetryConfig>): ErrorHandlingService {
    if (!globalErrorService) {
        globalErrorService = new ErrorHandlingService(config);
    }
    return globalErrorService;
}
