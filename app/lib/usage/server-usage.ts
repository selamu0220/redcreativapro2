import { createAdminClient, APPWRITE_DB_ID } from '../server/appwrite';
import { Query, ID } from 'node-appwrite';

const COLLECTION_ID = 'usage_stats';
const DAILY_LIMIT = 3;

export const serverUsage = {
    async checkUsageCount(userId: string): Promise<{ usage: number; limit: number; allowed: boolean }> {
        if (!userId) {
            return { usage: 0, limit: DAILY_LIMIT, allowed: false };
        }

        // Admin Override - Safety check (though should be handled by caller too)
        // We can check user email if we had it, but userId is opaque.
        // Let caller handle admin bypass for now to keep this pure usage logic.

        const date = new Date().toISOString().split('T')[0];
        const { databases } = createAdminClient();

        try {
            // Find document for this user and date
            const response = await databases.listDocuments(
                APPWRITE_DB_ID,
                COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.equal('date', date)
                ]
            );

            if (response.total > 0) {
                const doc = response.documents[0];
                const usage = doc.count;
                return {
                    usage,
                    limit: DAILY_LIMIT,
                    allowed: usage < DAILY_LIMIT
                };
            }

            return { usage: 0, limit: DAILY_LIMIT, allowed: true };
        } catch (error) {
            console.error('Error checking usage limit Appwrite:', error);
            // Fail open
            return { usage: 0, limit: DAILY_LIMIT, allowed: true };
        }
    },

    async incrementUsage(userId: string): Promise<number> {
        if (!userId) return 0;

        const date = new Date().toISOString().split('T')[0];
        const { databases } = createAdminClient();

        try {
            // Check if exists first
            const response = await databases.listDocuments(
                APPWRITE_DB_ID,
                COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.equal('date', date)
                ]
            );

            if (response.total > 0) {
                const doc = response.documents[0];
                const newCount = doc.count + 1;
                await databases.updateDocument(
                    APPWRITE_DB_ID,
                    COLLECTION_ID,
                    doc.$id,
                    { count: newCount }
                );
                return newCount;
            } else {
                // Create new
                await databases.createDocument(
                    APPWRITE_DB_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    {
                        userId,
                        date,
                        count: 1
                    }
                );
                return 1;
            }
        } catch (error) {
            console.error('Error incrementing usage Appwrite:', error);
            return 0;
        }
    },

    async getUsage(userId: string): Promise<number> {
        const { usage } = await this.checkUsageCount(userId);
        return usage;
    }
};
