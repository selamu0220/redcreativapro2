/**
 * Real-Time Analysis Engine
 * 
 * Provides interval-based text analysis that triggers every 2 seconds
 * with debouncing, background processing, and non-blocking UI updates.
 * 
 * Requirements: 1.1, 1.3, 1.5, 12.1, 12.2
 */

export interface AnalysisConfig {
  interval: number; // Analysis interval in milliseconds (default: 2000)
  debounceDelay: number; // Debounce delay in milliseconds (default: 300)
  minContentLength: number; // Minimum content length to trigger analysis (default: 10)
  enabled: boolean; // Whether analysis is enabled
}

export interface AnalysisResult {
  timestamp: number;
  contentHash: string; // Hash of analyzed content to avoid duplicate analysis
  suggestions: Suggestion[];
  processingTime: number; // Time taken for analysis in milliseconds
}

export interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'seo' | 'clarity';
  originalText: string;
  suggestedText: string;
  explanation: string;
  confidence: number; // 0-1 scale
  position: { start: number; end: number };
}

export type AnalysisCallback = (result: AnalysisResult) => void;
export type ErrorCallback = (error: Error) => void;

const DEFAULT_CONFIG: AnalysisConfig = {
  interval: 2000, // 2 seconds
  debounceDelay: 300, // 300ms debounce
  minContentLength: 10,
  enabled: true
};

/**
 * Real-Time Analysis Engine Class
 * 
 * Manages continuous text analysis with:
 * - 2-second interval timer
 * - Debouncing to prevent excessive API calls
 * - Background processing via Web Workers (when available)
 * - Non-blocking UI updates
 */
export class RealTimeAnalysisEngine {
  private config: AnalysisConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private debounceTimeoutId: NodeJS.Timeout | null = null;
  private lastAnalyzedContent: string = '';
  private lastAnalyzedHash: string = '';
  private isAnalyzing: boolean = false;
  private analysisCallback: AnalysisCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private lastAnalysisTime: number = 0;

  constructor(config: Partial<AnalysisConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the real-time analysis engine
   * 
   * @param callback - Function to call with analysis results
   * @param errorCallback - Function to call on errors
   */
  start(callback: AnalysisCallback, errorCallback?: ErrorCallback): void {
    if (this.intervalId) {
      console.warn('Analysis engine already running');
      return;
    }

    this.analysisCallback = callback;
    this.errorCallback = errorCallback || null;

    // Start interval timer for 2-second analysis cycle
    this.intervalId = setInterval(() => {
      this.triggerAnalysis();
    }, this.config.interval);

    console.log(`Real-time analysis engine started (interval: ${this.config.interval}ms)`);
  }

  /**
   * Stop the real-time analysis engine
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
      this.debounceTimeoutId = null;
    }

    this.isAnalyzing = false;
    console.log('Real-time analysis engine stopped');
  }

  /**
   * Update the content to be analyzed
   * 
   * This method is called when the user types. It uses debouncing
   * to avoid triggering analysis on every keystroke.
   * 
   * @param content - Current editor content
   */
  updateContent(content: string): void {
    this.lastAnalyzedContent = content;

    // Clear existing debounce timeout
    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
    }

    // Set new debounce timeout
    this.debounceTimeoutId = setTimeout(() => {
      // Content has stabilized, ready for next interval analysis
      this.debounceTimeoutId = null;
    }, this.config.debounceDelay);
  }

  /**
   * Update configuration
   * 
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<AnalysisConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...config };

    // Restart if interval changed
    if (config.interval && this.intervalId) {
      this.stop();
      if (this.analysisCallback) {
        this.start(this.analysisCallback, this.errorCallback || undefined);
      }
    }

    // Handle enable/disable
    if (wasEnabled && !this.config.enabled) {
      this.stop();
    } else if (!wasEnabled && this.config.enabled && this.analysisCallback) {
      this.start(this.analysisCallback, this.errorCallback || undefined);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalysisConfig {
    return { ...this.config };
  }

  /**
   * Check if engine is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Check if analysis is currently in progress
   */
  isProcessing(): boolean {
    return this.isAnalyzing;
  }

  /**
   * Get time since last analysis (in milliseconds)
   */
  getTimeSinceLastAnalysis(): number {
    if (this.lastAnalysisTime === 0) return Infinity;
    return Date.now() - this.lastAnalysisTime;
  }

  /**
   * Trigger analysis (called by interval timer)
   * 
   * This method checks if conditions are met for analysis and
   * performs the analysis in the background without blocking the UI.
   */
  private async triggerAnalysis(): Promise<void> {
    // Skip if disabled
    if (!this.config.enabled) {
      return;
    }

    // Skip if already analyzing
    if (this.isAnalyzing) {
      return;
    }

    // Skip if content is too short
    if (this.lastAnalyzedContent.length < this.config.minContentLength) {
      return;
    }

    // Skip if content hasn't changed since last analysis
    const contentHash = this.hashContent(this.lastAnalyzedContent);
    if (contentHash === this.lastAnalyzedHash) {
      return;
    }

    // Skip if debounce is still active (user is still typing)
    if (this.debounceTimeoutId !== null) {
      return;
    }

    // Perform analysis
    await this.performAnalysis(this.lastAnalyzedContent, contentHash);
  }

  /**
   * Perform the actual analysis
   * 
   * This runs in the background using requestIdleCallback (when available)
   * to avoid blocking the UI thread.
   * 
   * @param content - Content to analyze
   * @param contentHash - Hash of the content
   */
  private async performAnalysis(content: string, contentHash: string): Promise<void> {
    this.isAnalyzing = true;
    const startTime = performance.now();

    try {
      // Use requestIdleCallback for background processing when available
      const suggestions = await this.runAnalysisInBackground(content);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Create analysis result
      const result: AnalysisResult = {
        timestamp: Date.now(),
        contentHash,
        suggestions,
        processingTime
      };

      // Update state
      this.lastAnalyzedHash = contentHash;
      this.lastAnalysisTime = Date.now();

      // Call callback with results (non-blocking)
      if (this.analysisCallback) {
        // Use setTimeout to ensure callback doesn't block
        setTimeout(() => {
          this.analysisCallback!(result);
        }, 0);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      if (this.errorCallback) {
        setTimeout(() => {
          this.errorCallback!(error as Error);
        }, 0);
      }
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Run analysis in background using requestIdleCallback
   * 
   * This ensures the analysis doesn't block the UI thread.
   * 
   * @param content - Content to analyze
   * @returns Promise with suggestions
   */
  private runAnalysisInBackground(content: string): Promise<Suggestion[]> {
    return new Promise((resolve) => {
      const analyze = () => {
        // Perform lightweight analysis
        // In a real implementation, this would call an AI service
        // For now, we'll return empty suggestions to demonstrate the engine
        const suggestions: Suggestion[] = [];
        resolve(suggestions);
      };

      // Use requestIdleCallback if available, otherwise use setTimeout
      if (typeof window !== 'undefined' && typeof window.requestIdleCallback !== 'undefined') {
        window.requestIdleCallback(() => analyze(), { timeout: 100 });
      } else {
        setTimeout(() => analyze(), 0);
      }
    });
  }

  /**
   * Generate a simple hash of content for comparison
   * 
   * @param content - Content to hash
   * @returns Hash string
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Force an immediate analysis (bypasses interval and debounce)
   * 
   * @param content - Content to analyze
   * @returns Promise with analysis result
   */
  async forceAnalysis(content: string): Promise<AnalysisResult> {
    const contentHash = this.hashContent(content);
    const startTime = performance.now();

    try {
      const suggestions = await this.runAnalysisInBackground(content);
      const endTime = performance.now();

      const result: AnalysisResult = {
        timestamp: Date.now(),
        contentHash,
        suggestions,
        processingTime: endTime - startTime
      };

      this.lastAnalyzedHash = contentHash;
      this.lastAnalysisTime = Date.now();

      return result;
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Create a singleton instance for global use
 */
let globalEngine: RealTimeAnalysisEngine | null = null;

/**
 * Get or create the global analysis engine instance
 * 
 * @param config - Optional configuration
 * @returns Global engine instance
 */
export function getGlobalAnalysisEngine(config?: Partial<AnalysisConfig>): RealTimeAnalysisEngine {
  if (!globalEngine) {
    globalEngine = new RealTimeAnalysisEngine(config);
  } else if (config) {
    globalEngine.updateConfig(config);
  }
  return globalEngine;
}

/**
 * Destroy the global analysis engine instance
 */
export function destroyGlobalAnalysisEngine(): void {
  if (globalEngine) {
    globalEngine.stop();
    globalEngine = null;
  }
}
