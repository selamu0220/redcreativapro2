import { Client, Databases, Users } from 'node-appwrite';

/**
 * Appwrite Server Client (Admin)
 */
export const createAdminClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    return {
        get databases() {
            return new Databases(client);
        },
        get users() {
            return new Users(client);
        }
    };
};

export const APPWRITE_DB_ID = 'main-db'; // Or env var
export const APPWRITE_SUBSCRIPTIONS_COLLECTION_ID = 'subscriptions'; // Or env var
