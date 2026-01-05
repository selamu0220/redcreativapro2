/**
 * Performance Optimization Service
 * 
 * Ensures optimal performance for documents up to 10,000 words:
 * - Memory management and cleanup
 * - Progress indicators for long operations
 * - Token usage optimization
 * - Automatic suggestion cleanup
 * 
 * Requirements: 12.3, 12.4, 12.5
 */

export interface PerformanceMetrics {
    documentWordCount: number;
    memoryUsageMB: number;
    avgResponseTimeMs: number;
    suggestionsInQueue: number;
    tokensUsedThisSession: number;
    lastCleanupTime: Date;
}

export interface PerformanceConfig {
    maxSuggestionsInMemory: number; // Default: 100
    cleanupIntervalMs: number; // Default: 60000 (1 minute)
    suggestionExpiryMs: number; // Default: 300000 (5 minutes)
    largeDocumentThreshold: number; // Default: 5000 words
    debounceMs: number; // Default: 2000ms
    maxTokensPerRequest: number; // Default: 4000
}

const DEFAULT_CONFIG: PerformanceConfig = {
    maxSuggestionsInMemory: 100,
    cleanupIntervalMs: 60000,
    suggestionExpiryMs: 300000,
    largeDocumentThreshold: 5000,
    debounceMs: 2000,
    maxTokensPerRequest: 4000,
};

/**
 * Manages performance optimization for the AI writer
 */
export class PerformanceOptimizationService {
    private config: PerformanceConfig;
    private suggestionCache: Map<string, { timestamp: Date; data: any }>;
    private cleanupInterval: NodeJS.Timeout | null;
    private metrics: PerformanceMetrics;

    constructor(config: Partial<PerformanceConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.suggestionCache = new Map();
        this.cleanupInterval = null;
        this.metrics = {
            documentWordCount: 0,
            memoryUsageMB: 0,
            avgResponseTimeMs: 0,
            suggestionsInQueue: 0,
            tokensUsedThisSession: 0,
            lastCleanupTime: new Date(),
        };

        this.startAutoCleanup();
    }

    /**
     * Start automatic cleanup of old suggestions
     */
    private startAutoCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupIntervalMs);
    }

    /**
     * Clean up old suggestions and free memory
     */
    cleanup(): void {
        const now = new Date();
        const expiryTime = now.getTime() - this.config.suggestionExpiryMs;

        let removedCount = 0;

        for (const [key, value] of this.suggestionCache.entries()) {
            if (value.timestamp.getTime() < expiryTime) {
                this.suggestionCache.delete(key);
                removedCount++;
            }
        }

        this.metrics.lastCleanupTime = now;
        this.metrics.suggestionsInQueue = this.suggestionCache.size;

        console.log(`[Performance] Cleaned up ${removedCount} old suggestions. Remaining: ${this.suggestionCache.size}`);
    }

    /**
     * Cache a suggestion to avoid re-processing
     */
    cacheSuggestion(key: string, data: any): void {
        // If cache is full, remove oldest entry
        if (this.suggestionCache.size >= this.config.maxSuggestionsInMemory) {
            const oldestKey = Array.from(this.suggestionCache.entries())
                .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime())[0]?.[0];

            if (oldestKey) {
                this.suggestionCache.delete(oldestKey);
            }
        }

        this.suggestionCache.set(key, {
            timestamp: new Date(),
            data,
        });
    }

    /**
     * Get cached suggestion if available
     */
    getCachedSuggestion(key: string): any | null {
        const cached = this.suggestionCache.get(key);

        if (!cached) {
            return null;
        }

        // Check if expired
        const now = new Date();
        if (now.getTime() - cached.timestamp.getTime() > this.config.suggestionExpiryMs) {
            this.suggestionCache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Calculate optimal chunk size for processing large documents
     */
    calculateOptimalChunkSize(totalWordCount: number): number {
        if (totalWordCount <= 1000) {
            return totalWordCount; // Process all at once
        }

        if (totalWordCount <= 3000) {
            return 1000; // Process in 1000-word chunks
        }

        if (totalWordCount <= 5000) {
            return 1500; // Process in 1500-word chunks
        }

        // For very large documents, use 2000-word chunks
        return 2000;
    }

    /**
     * Split text into optimally-sized chunks
     */
    splitIntoChunks(text: string, wordCount: number): string[] {
        const chunkSize = this.calculateOptimalChunkSize(wordCount);
        const words = text.split(/\s+/);
        const chunks: string[] = [];

        for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            chunks.push(chunk);
        }

        return chunks;
    }

    /**
     * Estimate token count for text (rough approximation)
     */
    estimateTokenCount(text: string): number {
        // Rough approximation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    /**
     * Optimize text for API request to stay within token limits
     */
    optimizeTextForAPI(text: string, maxTokens: number = this.config.maxTokensPerRequest): string {
        const estimatedTokens = this.estimateTokenCount(text);

        if (estimatedTokens <= maxTokens) {
            return text;
        }

        // Truncate to fit within limits (leaving room for prompt)
        const targetChars = (maxTokens - 500) * 4; // Reserve 500 tokens for prompt
        return text.substring(0, targetChars);
    }

    /**
     * Track token usage
     */
    trackTokenUsage(tokens: number): void {
        this.metrics.tokensUsedThisSession += tokens;
    }

    /**
     * Get estimated cost for current session
     */
    getEstimatedCost(): number {
        // Typical pricing: $0.002 per 1K tokens
        return (this.metrics.tokensUsedThisSession / 1000) * 0.002;
    }

    /**
     * Check if document is large and needs special handling
     */
    isLargeDocument(wordCount: number): boolean {
        return wordCount >= this.config.largeDocumentThreshold;
    }

    /**
     * Get recommended debounce time based on document size
     */
    getRecommendedDebounce(wordCount: number): number {
        if (wordCount < 1000) return this.config.debounceMs;
        if (wordCount < 3000) return this.config.debounceMs * 1.5;
        if (wordCount < 5000) return this.config.debounceMs * 2;
        return this.config.debounceMs * 2.5; // Even longer for very large docs
    }

    /**
     * Update performance metrics
     */
    updateMetrics(updates: Partial<PerformanceMetrics>): void {
        this.metrics = { ...this.metrics, ...updates };
    }

    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    /**
     * Check if performance is degraded
     */
    isPerformanceDegraded(): {
        degraded: boolean;
        reasons: string[];
    } {
        const reasons: string[] = [];

        if (this.metrics.avgResponseTimeMs > 3000) {
            reasons.push('Average response time exceeds 3 seconds');
        }

        if (this.metrics.suggestionsInQueue > this.config.maxSuggestionsInMemory * 0.8) {
            reasons.push('Suggestion queue near capacity');
        }

        if (this.metrics.memoryUsageMB > 200) {
            reasons.push('High memory usage detected');
        }

        return {
            degraded: reasons.length > 0,
            reasons,
        };
    }

    /**
     * Get performance recommendations
     */
    getOptimizationRecommendations(wordCount: number): string[] {
        const recommendations: string[] = [];

        if (this.isLargeDocument(wordCount)) {
            recommendations.push('Este es un documento grande. El análisis puede tomar más tiempo.');
            recommendations.push('Considera dividir en secciones más pequeñas para mejor rendimiento.');
        }

        const performance = this.isPerformanceDegraded();
        if (performance.degraded) {
            recommendations.push('Rendimiento degradado detectado.');
            recommendations.push('Sugerencia: Limpia sugerencias antiguas o reduce el tamaño del documento.');
        }

        const estimatedCost = this.getEstimatedCost();
        if (estimatedCost > 0.10) {
            recommendations.push(`Has usado aproximadamente $${estimatedCost.toFixed(4)} en tokens esta sesión.`);
        }

        return recommendations;
    }

    /**
     * Destroy service and cleanup resources
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        this.suggestionCache.clear();
    }
}

/**
 * Progress indicator for long operations
 */
export class ProgressIndicatorService {
    private activeOperations: Map<string, {
        startTime: Date;
        estimatedDuration: number;
        message: string;
    }>;

    constructor() {
        this.activeOperations = new Map();
    }

    /**
     * Start tracking an operation
     */
    startOperation(
        id: string,
        message: string,
        estimatedDurationMs: number = 2000
    ): void {
        this.activeOperations.set(id, {
            startTime: new Date(),
            estimatedDuration: estimatedDurationMs,
            message,
        });
    }

    /**
     * End tracking an operation
     */
    endOperation(id: string): number {
        const operation = this.activeOperations.get(id);
        if (!operation) return 0;

        const duration = new Date().getTime() - operation.startTime.getTime();
        this.activeOperations.delete(id);

        return duration;
    }

    /**
     * Get current progress percentage for an operation
     */
    getProgress(id: string): number {
        const operation = this.activeOperations.get(id);
        if (!operation) return 100;

        const elapsed = new Date().getTime() - operation.startTime.getTime();
        const progress = Math.min((elapsed / operation.estimatedDuration) * 100, 99);

        return Math.round(progress);
    }

    /**
     * Check if operation should show progress indicator
     */
    shouldShowProgress(id: string, thresholdMs: number = 2000): boolean {
        const operation = this.activeOperations.get(id);
        if (!operation) return false;

        const elapsed = new Date().getTime() - operation.startTime.getTime();
        return elapsed >= thresholdMs;
    }

    /**
     * Get operation message
     */
    getMessage(id: string): string {
        return this.activeOperations.get(id)?.message || '';
    }

    /**
     * Get all active operations
     */
    getActiveOperations(): Array<{
        id: string;
        message: string;
        progress: number;
    }> {
        return Array.from(this.activeOperations.entries()).map(([id, op]) => ({
            id,
            message: op.message,
            progress: this.getProgress(id),
        }));
    }
}

/**
 * Create singleton instances
 */
let performanceService: PerformanceOptimizationService | null = null;
let progressService: ProgressIndicatorService | null = null;

export function getPerformanceService(config?: Partial<PerformanceConfig>): PerformanceOptimizationService {
    if (!performanceService) {
        performanceService = new PerformanceOptimizationService(config);
    }
    return performanceService;
}

export function getProgressService(): ProgressIndicatorService {
    if (!progressService) {
        progressService = new ProgressIndicatorService();
    }
    return progressService;
}
