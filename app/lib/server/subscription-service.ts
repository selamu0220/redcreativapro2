import { createAdminClient, APPWRITE_DB_ID, APPWRITE_SUBSCRIPTIONS_COLLECTION_ID } from './appwrite';
import { ID, Query } from 'node-appwrite';

export interface SubscriptionData {
    userId: string;
    stripeCustomerId: string;
    status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
    priceId: string;
    currentPeriodEnd: Date;
}

export async function getSubscription(userId: string) {
    const { databases } = createAdminClient();
    try {
        const response = await databases.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
            [Query.equal('userId', userId)]
        );

        if (response.total > 0) {
            return response.documents[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
}

export async function getSubscriptionByCustomerId(customerId: string) {
    const { databases } = createAdminClient();
    try {
        const response = await databases.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
            [Query.equal('stripeCustomerId', customerId)]
        );

        if (response.total > 0) {
            return response.documents[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching subscription by customer ID:', error);
        return null;
    }
}

export async function upsertSubscription(data: SubscriptionData) {
    const { databases } = createAdminClient();

    // Check if exists
    const existing = await getSubscription(data.userId);

    const payload = {
        userId: data.userId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status,
        priceId: data.priceId,
        currentPeriodEnd: data.currentPeriodEnd.toISOString(),
    };

    try {
        if (existing) {
            return await databases.updateDocument(
                APPWRITE_DB_ID,
                APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
                existing.$id,
                payload
            );
        } else {
            return await databases.createDocument(
                APPWRITE_DB_ID,
                APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
                ID.unique(),
                payload
            );
        }
    } catch (error) {
        console.error('Error upserting subscription:', error);
        throw error;
    }
}
