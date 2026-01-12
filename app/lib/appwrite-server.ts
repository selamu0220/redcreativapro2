import { Client, Databases, ID, Permission, Role, IndexType } from 'node-appwrite';

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
const COLLECTION_ID = 'user_documents';

// Initialize client with fallback to avoid build failures if env vars are missing
const client = new Client()
    .setEndpoint(ENDPOINT);

if (PROJECT_ID) client.setProject(PROJECT_ID);
if (API_KEY) client.setKey(API_KEY);

const databases = new Databases(client);

// Ensure Database and Collection exist
export async function getOrCreateCollection() {
    if (!PROJECT_ID || !API_KEY) {
        throw new Error('Appwrite credentials not configured. Please add APPWRITE_PROJECT_ID and APPWRITE_API_KEY to your environment variables.');
    }

    try {
        await databases.get(DATABASE_ID);
    } catch {
        console.log('Creating Database...');
        await databases.create(DATABASE_ID, 'AI Writer Database');
    }

    let collection;
    try {
        collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    } catch {
        console.log('Creating Collection...');
        collection = await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'User Documents');
    }

    // Ensure Attributes exist (Idempotent)
    // We catch 409 (Conflict) which means it already exists.
    const attributes = [
        { key: 'owner_id', size: 100, required: true },
        { key: 'title', size: 255, required: false },
        { key: 'content', size: 1000000, required: true },
        { key: 'mode', size: 50, required: false },
        { key: 'language', size: 10, required: false },
    ];

    await Promise.all(attributes.map(async (attr) => {
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, attr.required);
        } catch (e: any) {
            // Ignore if attribute already exists
            if (e.code !== 409) {
                console.error(`Error creating attribute ${attr.key}:`, e);
            }
        }
    }));

    // Ensure Index
    try {
        await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'idx_owner', IndexType.Key, ['owner_id'], ['ASC']);
    } catch (e: any) {
        if (e.code !== 409) {
            console.error('Error creating index:', e);
        }
    }

    return { DATABASE_ID, COLLECTION_ID };
}

export { client, databases, DATABASE_ID, COLLECTION_ID, ID, Permission, Role };
