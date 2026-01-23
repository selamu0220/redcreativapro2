import { Client, Databases, ID, IndexType } from 'node-appwrite';

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
export const BLOG_INTEGRATIONS_COLLECTION_ID = 'blog_integrations';
export const PUBLISHED_ARTICLES_COLLECTION_ID = 'published_articles';

// Platform types supported
export type BlogPlatform =
    | 'wordpress'
    | 'ghost'
    | 'strapi'
    | 'sanity'
    | 'webflow'
    | 'contentful'
    | 'prismic'
    | 'storyblok';

// Blog integration document type
export interface BlogIntegration {
    $id?: string;
    user_id: string;
    platform: BlogPlatform;
    name: string;
    site_url: string;
    credentials: string; // Encrypted JSON
    is_active: boolean;
    last_used?: string;
    created_at: string;
    $createdAt?: string;
    $updatedAt?: string;
}

// Published article tracking
export interface PublishedArticle {
    $id?: string;
    user_id: string;
    integration_id: string;
    document_id: string;
    external_id: string;
    external_url: string;
    status: 'published' | 'draft' | 'scheduled' | 'failed';
    published_at: string;
    $createdAt?: string;
    $updatedAt?: string;
}

// Create Appwrite client
function createAdminClient() {
    if (!PROJECT_ID || !API_KEY) {
        throw new Error('Appwrite credentials not configured. Please add APPWRITE_PROJECT_ID and APPWRITE_API_KEY.');
    }

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    return new Databases(client);
}

// Ensure blog integrations collection exists
export async function ensureBlogIntegrationsCollection(): Promise<void> {
    const databases = createAdminClient();

    // Ensure database exists
    try {
        await databases.get(DATABASE_ID);
    } catch {
        console.log('Creating Database...');
        await databases.create(DATABASE_ID, 'Main Database');
    }

    // Ensure blog_integrations collection
    try {
        await databases.getCollection(DATABASE_ID, BLOG_INTEGRATIONS_COLLECTION_ID);
        console.log('blog_integrations collection exists');
    } catch {
        console.log('Creating blog_integrations collection...');
        await databases.createCollection(DATABASE_ID, BLOG_INTEGRATIONS_COLLECTION_ID, 'Blog Integrations');

        // Create attributes
        const stringAttrs = [
            { key: 'user_id', size: 100, required: true },
            { key: 'platform', size: 50, required: true },
            { key: 'name', size: 255, required: true },
            { key: 'site_url', size: 500, required: true },
            { key: 'credentials', size: 10000, required: true }, // Encrypted JSON
            { key: 'last_used', size: 50, required: false },
            { key: 'created_at', size: 50, required: true },
        ];

        for (const attr of stringAttrs) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    BLOG_INTEGRATIONS_COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required
                );
            } catch (e: any) {
                if (e.code !== 409) console.error(`Error creating ${attr.key}:`, e);
            }
        }

        // Boolean attribute
        try {
            await databases.createBooleanAttribute(
                DATABASE_ID,
                BLOG_INTEGRATIONS_COLLECTION_ID,
                'is_active',
                true,
                true // default value
            );
        } catch (e: any) {
            if (e.code !== 409) console.error('Error creating is_active:', e);
        }

        // Create index on user_id
        try {
            await databases.createIndex(
                DATABASE_ID,
                BLOG_INTEGRATIONS_COLLECTION_ID,
                'idx_user',
                IndexType.Key,
                ['user_id'],
                ['ASC']
            );
        } catch (e: any) {
            if (e.code !== 409) console.error('Error creating index:', e);
        }
    }
}

// Ensure published articles collection exists
export async function ensurePublishedArticlesCollection(): Promise<void> {
    const databases = createAdminClient();

    try {
        await databases.getCollection(DATABASE_ID, PUBLISHED_ARTICLES_COLLECTION_ID);
        console.log('published_articles collection exists');
    } catch {
        console.log('Creating published_articles collection...');
        await databases.createCollection(DATABASE_ID, PUBLISHED_ARTICLES_COLLECTION_ID, 'Published Articles');

        const stringAttrs = [
            { key: 'user_id', size: 100, required: true },
            { key: 'integration_id', size: 100, required: true },
            { key: 'document_id', size: 100, required: true },
            { key: 'external_id', size: 255, required: true },
            { key: 'external_url', size: 1000, required: true },
            { key: 'status', size: 50, required: true },
            { key: 'published_at', size: 50, required: true },
        ];

        for (const attr of stringAttrs) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    PUBLISHED_ARTICLES_COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required
                );
            } catch (e: any) {
                if (e.code !== 409) console.error(`Error creating ${attr.key}:`, e);
            }
        }

        // Create indexes
        try {
            await databases.createIndex(
                DATABASE_ID,
                PUBLISHED_ARTICLES_COLLECTION_ID,
                'idx_user',
                IndexType.Key,
                ['user_id'],
                ['ASC']
            );
            await databases.createIndex(
                DATABASE_ID,
                PUBLISHED_ARTICLES_COLLECTION_ID,
                'idx_integration',
                IndexType.Key,
                ['integration_id'],
                ['ASC']
            );
        } catch (e: any) {
            if (e.code !== 409) console.error('Error creating indexes:', e);
        }
    }
}

// Provision all blog-related collections
export async function provisionBlogSchema(): Promise<void> {
    console.log('Provisioning blog integration schema...');
    await ensureBlogIntegrationsCollection();
    await ensurePublishedArticlesCollection();
    console.log('Blog schema provisioned successfully!');
}

export { ID };
