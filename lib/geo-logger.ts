/**
 * Structured Logging System for GEO Optimization
 * 
 * Provides comprehensive logging for GEO analysis operations with structured data
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  operation: string;
  message: string;
  data?: any;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    contentLength?: number;
    analysisType?: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxStoredLogs: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  maxStoredLogs: 100
};

export class GEOLogger {
  private config: LoggerConfig;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private createLogEntry(
    level: LogLevel,
    component: string,
    operation: string,
    message: string,
    data?: any,
    error?: Error,
    duration?: number
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      operation,
      message,
      data,
      duration,
      metadata: {
        sessionId: this.sessionId,
        // userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server', // Removed as it's not in metadata type
        // url: typeof window !== 'undefined' ? window.location.href : 'server' // Removed as it's not in metadata type
      }
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    return entry;
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    // Console logging
    if (this.config.enableConsole) {
      const logMethod = entry.level === LogLevel.ERROR ? console.error :
                       entry.level === LogLevel.WARN ? console.warn :
                       entry.level === LogLevel.DEBUG ? console.debug :
                       console.log;

      logMethod(`[GEO] ${entry.component}:${entry.operation}`, entry.message, entry.data || '');
    }

    // Local storage logging
    if (this.config.enableStorage && typeof window !== 'undefined') {
      try {
        const existingLogs = JSON.parse(localStorage.getItem('geo-logs') || '[]');
        existingLogs.push(entry);
        
        // Keep only recent logs
        const recentLogs = existingLogs.slice(-this.config.maxStoredLogs);
        localStorage.setItem('geo-logs', JSON.stringify(recentLogs));
      } catch (storageError) {
        console.warn('Failed to store log entry:', storageError);
      }
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry)
        });
      } catch (remoteError) {
        console.warn('Failed to send log to remote endpoint:', remoteError);
      }
    }
  }

  debug(component: string, operation: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, component, operation, message, data);
      this.writeLog(entry);
    }
  }

  info(component: string, operation: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, component, operation, message, data);
      this.writeLog(entry);
    }
  }

  warn(component: string, operation: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, component, operation, message, data);
      this.writeLog(entry);
    }
  }

  error(component: string, operation: string, message: string, error?: Error, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, component, operation, message, data, error);
      this.writeLog(entry);
    }
  }

  /**
   * Time an operation and log the duration
   */
  async timeOperation<T>(
    component: string,
    operation: string,
    fn: () => Promise<T>,
    data?: any
  ): Promise<T> {
    const startTime = Date.now();
    
    this.debug(component, operation, 'Operation started', data);
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      this.info(component, operation, 'Operation completed successfully', {
        ...data,
        duration: `${duration}ms`
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.error(component, operation, 'Operation failed', error as Error, {
        ...data,
        duration: `${duration}ms`
      });
      
      throw error;
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Partial<LogEntry['metadata']>): GEOLogger {
    const childLogger = new GEOLogger(this.config);
    childLogger.sessionId = this.sessionId;
    
    // Override createLogEntry to include additional context
    const originalCreateLogEntry = childLogger.createLogEntry.bind(childLogger);
    childLogger.createLogEntry = (level, component, operation, message, data, error, duration) => {
      const entry = originalCreateLogEntry(level, component, operation, message, data, error, duration);
      entry.metadata = { ...entry.metadata, ...additionalContext };
      return entry;
    };
    
    return childLogger;
  }

  /**
   * Get recent logs from storage
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const logs = JSON.parse(localStorage.getItem('geo-logs') || '[]');
      return logs.slice(-count);
    } catch (error) {
      console.warn('Failed to retrieve logs:', error);
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('geo-logs');
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    const logs = this.getRecentLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Global logger instance
export const geoLogger = new GEOLogger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false // Enable in production with proper endpoint
});

/**
 * Performance monitoring utilities
 */
export class GEOPerformanceMonitor {
  private static instance: GEOPerformanceMonitor;
  private logger: GEOLogger;
  private metrics: Map<string, number[]> = new Map();

  constructor(logger: GEOLogger) {
    this.logger = logger;
  }

  static getInstance(logger: GEOLogger = geoLogger): GEOPerformanceMonitor {
    if (!GEOPerformanceMonitor.instance) {
      GEOPerformanceMonitor.instance = new GEOPerformanceMonitor(logger);
    }
    return GEOPerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
    
    this.logger.debug('PerformanceMonitor', 'recordMetric', `Recorded ${name}: ${value}`, {
      metric: name,
      value,
      count: values.length
    });
  }

  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [name] of this.metrics) {
      const stats = this.getMetricStats(name);
      if (stats) {
        result[name] = stats;
      }
    }
    
    return result;
  }
}

// Global performance monitor
export const geoPerformanceMonitor = GEOPerformanceMonitor.getInstance();