import { LanguageCode } from './geo-detection'

export interface DateFormatterOptions {
    locale: string
    timezone: string
}

export class DateFormatter {
    private locale: string
    private timezone: string

    constructor(options: DateFormatterOptions) {
        this.locale = options.locale
        this.timezone = options.timezone
    }

    /**
     * Format a date object or timestamp string
     */
    formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
        const dateObj = this.toDate(date)

        // Default options for date
        const defaultOptions: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: this.timezone
        }

        return new Intl.DateTimeFormat(this.locale, { ...defaultOptions, ...options }).format(dateObj)
    }

    /**
     * Format time
     */
    formatTime(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
        const dateObj = this.toDate(date)

        // Default options for time
        const defaultOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: this.timezone
        }

        return new Intl.DateTimeFormat(this.locale, { ...defaultOptions, ...options }).format(dateObj)
    }

    /**
     * Format both date and time
     */
    formatDateTime(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
        const dateObj = this.toDate(date)

        const defaultOptions: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: this.timezone
        }

        return new Intl.DateTimeFormat(this.locale, { ...defaultOptions, ...options }).format(dateObj)
    }

    /**
     * Format relative time (e.g. "2 hours ago", "hace 2 horas")
     */
    formatRelative(date: Date | string | number): string {
        const dateObj = this.toDate(date)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

        const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' })

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        }

        for (const [unit, seconds] of Object.entries(intervals)) {
            if (Math.abs(diffInSeconds) >= seconds) {
                const value = Math.round(diffInSeconds / seconds) * -1 // Negative for past
                return rtf.format(value, unit as Intl.RelativeTimeFormatUnit)
            }
        }

        return rtf.format(0, 'second') // "now"
    }

    private toDate(date: Date | string | number): Date {
        if (date instanceof Date) return date
        return new Date(date)
    }
}

/**
 * Get date format patterns for different regions
 * Useful for placeholders or instructions
 */
export function getDateFormatPattern(language: LanguageCode): string {
    switch (language) {
        case 'es':
        case 'pt':
            return 'DD/MM/AAAA'
        default:
            return 'MM/DD/YYYY'
    }
}
