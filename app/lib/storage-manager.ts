/**
 * Storage Manager
 * Handles client-side persistence with Time-To-Live (TTL) support
 * Safe wrapper for localStorage/sessionStorage
 */

interface StorageItem<T> {
    value: T
    expiry: number
}

export class StorageManager {
    private prefix: string
    private storage: Storage | null

    constructor(prefix: string = 'rc_latam_', type: 'local' | 'session' = 'local') {
        this.prefix = prefix
        this.storage = this.isAvailable(type) ? window[type === 'local' ? 'localStorage' : 'sessionStorage'] : null
    }

    /**
     * Check if storage is available
     */
    private isAvailable(type: 'local' | 'session'): boolean {
        if (typeof window === 'undefined') return false
        try {
            const storage = window[type === 'local' ? 'localStorage' : 'sessionStorage']
            const x = '__storage_test__'
            storage.setItem(x, x)
            storage.removeItem(x)
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * Set item with optional TTL (in milliseconds)
     */
    set<T>(key: string, value: T, ttl?: number): boolean {
        if (!this.storage) return false

        try {
            const item: StorageItem<T> = {
                value,
                expiry: ttl ? Date.now() + ttl : 0
            }
            this.storage.setItem(this.prefix + key, JSON.stringify(item))
            return true
        } catch (error) {
            console.warn('Storage quota exceeded or error:', error)
            return false
        }
    }

    /**
     * Get item, checking for expiration
     */
    get<T>(key: string): T | null {
        if (!this.storage) return null

        try {
            const itemStr = this.storage.getItem(this.prefix + key)
            if (!itemStr) return null

            const item: StorageItem<T> = JSON.parse(itemStr)

            // Check expiry
            if (item.expiry && Date.now() > item.expiry) {
                this.remove(key)
                return null
            }

            return item.value
        } catch (error) {
            console.error('Storage parse error:', error)
            return null
        }
    }

    /**
     * Remove item
     */
    remove(key: string): void {
        if (!this.storage) return
        this.storage.removeItem(this.prefix + key)
    }

    /**
     * Clear all items with prefix
     */
    clear(): void {
        if (!this.storage) return

        // Iterate backwards to avoid index issues when removing
        for (let i = this.storage.length - 1; i >= 0; i--) {
            const key = this.storage.key(i)
            if (key && key.startsWith(this.prefix)) {
                this.storage.removeItem(key)
            }
        }
    }
}

export const storageManager = new StorageManager()
