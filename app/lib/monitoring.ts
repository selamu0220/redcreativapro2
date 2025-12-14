/**
 * Monitoring Service
 * Handles error tracking and performance logging for production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: Record<string, any>
    environment: string
}

class MonitoringService {
    private environment: string

    constructor() {
        this.environment = process.env.NODE_ENV || 'development'
    }

    /**
     * Log an event
     */
    log(level: LogLevel, message: string, context?: Record<string, any>) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            environment: this.environment
        }

        // In development, just console log with colors
        if (this.environment === 'development') {
            this.consoleLog(entry)
            return
        }

        // In production, sending to external service (mocked here)
        // Sentry.captureMessage(message, { level, extra: context })
        // Datadog.log(message, context)
        this.consoleLog(entry) // Fallback to console for demo
    }

    /**
     * Track an error with stack trace
     */
    trackError(error: Error, context?: Record<string, any>) {
        this.log('error', error.message, {
            stack: error.stack,
            ...context
        })

        // In production: Sentry.captureException(error)
    }

    /**
     * Track a business metric
     */
    trackMetric(name: string, value: number, tags?: Record<string, string>) {
        if (this.environment === 'development') {
            console.log(`[Metric] ${name}: ${value}`, tags)
        }
        // In production: Datadog.distribution(name, value, tags)
    }

    private consoleLog(entry: LogEntry) {
        const style = {
            info: 'color: #00bfff',
            warn: 'color: #ffa500',
            error: 'color: #ff0000',
            debug: 'color: #808080'
        }

        console.log(
            `%c[${entry.level.toUpperCase()}] ${entry.message}`,
            style[entry.level],
            entry.context || ''
        )
    }
}

export const monitor = new MonitoringService()
