import { kv } from '@vercel/kv';

const DAILY_LIMIT = 3;

/**
 * Helper to track daily usage for free users.
 * Keys are formatted as: `usage:{userId}:{date}` (e.g., usage:user_123:2023-10-27)
 * Expires after 24 hours.
 */
export const serverUsage = {
    async checkUsageCount(userId: string): Promise<{ usage: number; limit: number; allowed: boolean }> {
        if (!userId) {
            return { usage: 0, limit: DAILY_LIMIT, allowed: false };
        }

        const date = new Date().toISOString().split('T')[0];
        const key = `usage:${userId}:${date}`;

        try {
            const usage = await kv.get<number>(key) || 0;
            return {
                usage,
                limit: DAILY_LIMIT,
                allowed: usage < DAILY_LIMIT
            };
        } catch (error) {
            console.error('Error checking usage limit:', error);
            // Fail open (allow) if KV is down, or closed? Failsafe to allow for now to avoid blocking users on errors
            return { usage: 0, limit: DAILY_LIMIT, allowed: true };
        }
    },

    async incrementUsage(userId: string): Promise<number> {
        if (!userId) return 0;

        const date = new Date().toISOString().split('T')[0];
        const key = `usage:${userId}:${date}`;

        try {
            // Increment and set expiry to 24 hours (86400 seconds) if it's a new key
            const newValue = await kv.incr(key);
            if (newValue === 1) {
                await kv.expire(key, 86400);
            }
            return newValue;
        } catch (error) {
            console.error('Error incrementing usage:', error);
            return 0;
        }
    },

    async getUsage(userId: string): Promise<number> {
        const { usage } = await this.checkUsageCount(userId);
        return usage;
    }
};
