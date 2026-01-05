/**
 * Security Service
 * 
 * Implements security measures:
 * - Input validation and sanitization
 * - Rate limiting to prevent abuse
 * - Data encryption
 * - GDPR/privacy compliance
 * - Data export and deletion capabilities
 * 
 * Requirement: Security and privacy considerations
 */

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    blockDurationMs?: number; // How long to block after exceeding
}

export interface RateLimitStatus {
    requestsRemaining: number;
    resetTime: Date;
    blocked: boolean;
    blockEndsAt?: Date;
}

export interface UserData {
    documents: any[];
    styleProfiles: any[];
    preferences: any;
    subscriptions: any;
}

/**
 * Input sanitization service
 */
export class InputSanitizer {
    /**
     * Sanitize HTML to prevent XSS attacks
     */
    sanitizeHTML(input: string): string {
        if (!input) return '';

        // Remove potentially dangerous tags
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers

        return sanitized;
    }

    /**
     * Sanitize text input (no HTML allowed)
     */
    sanitizeText(input: string): string {
        if (!input) return '';

        // Remove all HTML tags
        return input
            .replace(/<[^>]*>/g, '')
            .trim();
    }

    /**
     * Validate and sanitize email
     */
    sanitizeEmail(email: string): string | null {
        if (!email) return null;

        const sanitized = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(sanitized) ? sanitized : null;
    }

    /**
     * Validate URL
     */
    sanitizeURL(url: string): string | null {
        if (!url) return null;

        try {
            const parsed = new URL(url);

            // Only allow http and https
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return null;
            }

            return parsed.toString();
        } catch {
            return null;
        }
    }

    /**
     * Sanitize filename (prevent directory traversal)
     */
    sanitizeFilename(filename: string): string {
        if (!filename) return 'untitled';

        return filename
            .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
            .replace(/\.{2,}/g, '.') // Remove multiple dots
            .replace(/^\.+/, '') // Remove leading dots
            .substring(0, 255); // Limit length
    }

    /**
     * Validate word count is reasonable
     */
    validateWordCount(text: string, maxWords: number = 50000): boolean {
        const wordCount = text.trim().split(/\s+/).length;
        return wordCount <= maxWords;
    }

    /**
     * Sanitize object (recursive)
     */
    sanitizeObject<T extends Record<string, any>>(obj: T): T {
        const sanitized = {} as T;

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key as keyof T] = this.sanitizeHTML(value) as any;
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key as keyof T] = this.sanitizeObject(value);
            } else {
                sanitized[key as keyof T] = value;
            }
        }

        return sanitized;
    }
}

/**
 * Rate limiting service
 */
export class RateLimiter {
    private requests: Map<string, number[]>; // userId -> timestamps
    private blockedUntil: Map<string, Date>; // userId -> unblock time
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.requests = new Map();
        this.blockedUntil = new Map();
        this.config = config;

        // Cleanup old entries periodically
        setInterval(() => this.cleanup(), this.config.windowMs);
    }

    /**
     * Check if request is allowed
     */
    checkLimit(userId: string): RateLimitStatus {
        // Check if blocked
        const blockEndsAt = this.blockedUntil.get(userId);
        if (blockEndsAt && blockEndsAt > new Date()) {
            return {
                requestsRemaining: 0,
                resetTime: new Date(Date.now() + this.config.windowMs),
                blocked: true,
                blockEndsAt,
            };
        } else if (blockEndsAt) {
            // Unblock
            this.blockedUntil.delete(userId);
            this.requests.delete(userId);
        }

        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        // Get requests in current window
        const userRequests = this.requests.get(userId) || [];
        const requestsInWindow = userRequests.filter(timestamp => timestamp > windowStart);

        // Update stored requests
        this.requests.set(userId, requestsInWindow);

        const remaining = Math.max(0, this.config.maxRequests - requestsInWindow.length);
        const resetTime = new Date(now + this.config.windowMs);

        // Check if exceeding limit
        if (requestsInWindow.length >= this.config.maxRequests) {
            // Block if configured
            if (this.config.blockDurationMs) {
                const blockUntil = new Date(now + this.config.blockDurationMs);
                this.blockedUntil.set(userId, blockUntil);

                return {
                    requestsRemaining: 0,
                    resetTime,
                    blocked: true,
                    blockEndsAt: blockUntil,
                };
            }

            return {
                requestsRemaining: 0,
                resetTime,
                blocked: false,
            };
        }

        return {
            requestsRemaining: remaining,
            resetTime,
            blocked: false,
        };
    }

    /**
     * Record a request
     */
    recordRequest(userId: string): void {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        userRequests.push(now);
        this.requests.set(userId, userRequests);
    }

    /**
     * Clean up old requests
     */
    private cleanup(): void {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        for (const [userId, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(t => t > windowStart);

            if (validTimestamps.length === 0) {
                this.requests.delete(userId);
            } else {
                this.requests.set(userId, validTimestamps);
            }
        }

        // Clean up expired blocks
        for (const [userId, blockUntil] of this.blockedUntil.entries()) {
            if (blockUntil < new Date()) {
                this.blockedUntil.delete(userId);
            }
        }
    }

    /**
     * Reset limits for a user
     */
    resetUser(userId: string): void {
        this.requests.delete(userId);
        this.blockedUntil.delete(userId);
    }
}

/**
 * Data encryption service (simplified - in production use proper encryption)
 */
export class DataEncryption {
    /**
     * Encrypt sensitive data
     * NOTE: This is a simplified implementation for demo.
     * In production, use Web Crypto API or a proper encryption library.
     */
    async encrypt(data: string, key?: string): Promise<string> {
        // In production, implement proper encryption
        // For now, just base64 encode (NOT SECURE FOR PRODUCTION)
        return Buffer.from(data).toString('base64');
    }

    /**
     * Decrypt data
     */
    async decrypt(encryptedData: string, key?: string): Promise<string> {
        // In production, implement proper decryption
        return Buffer.from(encryptedData, 'base64').toString('utf-8');
    }

    /**
     * Hash sensitive data (one-way)
     */
    async hash(data: string): Promise<string> {
        // In production, use a proper hashing algorithm like bcrypt or SHA-256
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // Fallback for Node.js environment
        return Buffer.from(data).toString('base64');
    }
}

/**
 * GDPR compliance service
 */
export class GDPRService {
    /**
     * Export all user data
     */
    async exportUserData(userId: string): Promise<UserData> {
        // In production, fetch from database
        return {
            documents: [],
            styleProfiles: [],
            preferences: {},
            subscriptions: {},
        };
    }

    /**
     * Delete all user data
     */
    async deleteUserData(userId: string): Promise<void> {
        // In production, delete from database
        console.log(`[GDPR] Deleting all data for user ${userId}`);
    }

    /**
     * Anonymize user data
     */
    async anonymizeUserData(userId: string): Promise<void> {
        // In production, anonymize personal identifiers
        console.log(`[GDPR] Anonymizing data for user ${userId}`);
    }

    /**
     * Check consent status
     */
    async checkConsent(userId: string, consentType: string): Promise<boolean> {
        // In production, check consent from database
        return false;
    }

    /**
     * Record consent
     */
    async recordConsent(
        userId: string,
        consentType: string,
        granted: boolean
    ): Promise<void> {
        console.log(`[GDPR] Recording ${consentType} consent for user ${userId}: ${granted}`);
    }
}

/**
 * Main security service
 */
export class SecurityService {
    public sanitizer: InputSanitizer;
    public encryption: DataEncryption;
    public gdpr: GDPRService;

    private rateLimiters: Map<string, RateLimiter>;

    constructor() {
        this.sanitizer = new InputSanitizer();
        this.encryption = new DataEncryption();
        this.gdpr = new GDPRService();
        this.rateLimiters = new Map();

        this.initializeRateLimiters();
    }

    /**
     * Initialize rate limiters for different operations
     */
    private initializeRateLimiters(): void {
        // AI analysis requests: 60 per minute
        this.rateLimiters.set('ai-analysis', new RateLimiter({
            windowMs: 60000,
            maxRequests: 60,
            blockDurationMs: 60000,
        }));

        // Document saves: 30 per minute
        this.rateLimiters.set('document-save', new RateLimiter({
            windowMs: 60000,
            maxRequests: 30,
        }));

        // Agent mode: 20 per minute
        this.rateLimiters.set('agent-mode', new RateLimiter({
            windowMs: 60000,
            maxRequests: 20,
            blockDurationMs: 120000, // 2 minute block
        }));

        // Style profile updates: 10 per hour
        this.rateLimiters.set('style-update', new RateLimiter({
            windowMs: 3600000,
            maxRequests: 10,
        }));
    }

    /**
     * Check rate limit for operation
     */
    checkRateLimit(operation: string, userId: string): RateLimitStatus {
        const limiter = this.rateLimiters.get(operation);

        if (!limiter) {
            // No rate limit for this operation
            return {
                requestsRemaining: Infinity,
                resetTime: new Date(),
                blocked: false,
            };
        }

        return limiter.checkLimit(userId);
    }

    /**
     * Record request for rate limiting
     */
    recordRequest(operation: string, userId: string): void {
        const limiter = this.rateLimiters.get(operation);
        limiter?.recordRequest(userId);
    }

    /**
     * Validate and sanitize user input
     */
    validateInput(input: {
        text?: string;
        html?: string;
        email?: string;
        url?: string;
        filename?: string;
    }): {
        valid: boolean;
        sanitized: typeof input;
        errors: string[];
    } {
        const errors: string[] = [];
        const sanitized: typeof input = {};

        if (input.text !== undefined) {
            sanitized.text = this.sanitizer.sanitizeText(input.text);

            if (!this.sanitizer.validateWordCount(sanitized.text)) {
                errors.push('Text exceeds maximum word count (50,000 words)');
            }
        }

        if (input.html !== undefined) {
            sanitized.html = this.sanitizer.sanitizeHTML(input.html);
        }

        if (input.email !== undefined) {
            const sanitizedEmail = this.sanitizer.sanitizeEmail(input.email);
            if (sanitizedEmail) {
                sanitized.email = sanitizedEmail;
            } else {
                errors.push('Invalid email format');
            }
        }

        if (input.url !== undefined) {
            const sanitizedURL = this.sanitizer.sanitizeURL(input.url);
            if (sanitizedURL) {
                sanitized.url = sanitizedURL;
            } else {
                errors.push('Invalid URL format');
            }
        }

        if (input.filename !== undefined) {
            sanitized.filename = this.sanitizer.sanitizeFilename(input.filename);
        }

        return {
            valid: errors.length === 0,
            sanitized,
            errors,
        };
    }

    /**
     * Check if user has permission for operation
     */
    async checkPermission(
        userId: string,
        operation: string,
        resource?: string
    ): Promise<boolean> {
        // In production, check against user's subscription and permissions
        return true;
    }
}

/**
 * Create singleton instance
 */
let globalSecurityService: SecurityService | null = null;

export function getSecurityService(): SecurityService {
    if (!globalSecurityService) {
        globalSecurityService = new SecurityService();
    }
    return globalSecurityService;
}
