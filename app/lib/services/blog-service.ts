
import { databases } from '../appwrite';
import { Query, Models } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main-db';
const COLLECTION_ID = 'blog_posts';

export interface BlogPost extends Models.Document {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    readTime: string;
    tags: string[]; // Parsed from JSON string if needed, or direct array
    image?: string;
    seoTitle?: string;
    seoDescription?: string;
    featured: boolean;
    trending: boolean;
    views: number;
    likes: number;
    publishedAt: string;
    premiumData?: any; // Parsed JSON
}

export const blogService = {
    async getAllPosts(limit = 10, offset = 0) {
        try {
            const response = await databases.listDocuments<BlogPost>(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('publishedAt'),
                    Query.equal('is_public', true) // Assuming there might be a draft status, if not we can remove
                ]
            );
            return {
                documents: response.documents.map(this.transformPost),
                total: response.total
            };
        } catch (error) {
            console.error('Error fetching all posts:', error);
            // Fallback for dev/demo if DB connection fails
            return { documents: [], total: 0 };
        }
    },

    async getPostBySlug(slug: string) {
        try {
            const response = await databases.listDocuments<BlogPost>(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('slug', slug),
                    Query.limit(1)
                ]
            );
            if (response.documents.length === 0) return null;
            return this.transformPost(response.documents[0]);
        } catch (error) {
            console.error(`Error fetching post by slug ${slug}:`, error);
            return null;
        }
    },

    async getFeaturedPosts() {
        try {
            const response = await databases.listDocuments<BlogPost>(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('featured', true),
                    Query.limit(3),
                    Query.orderDesc('publishedAt')
                ]
            );
            return response.documents.map(this.transformPost);
        } catch (error) {
            console.error('Error fetching featured posts:', error);
            return [];
        }
    },

    async getRecentPosts(limit = 5) {
        try {
            const response = await databases.listDocuments<BlogPost>(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.limit(limit),
                    Query.orderDesc('publishedAt')
                ]
            );
            return response.documents.map(this.transformPost);
        } catch (error) {
            console.error('Error fetching recent posts:', error);
            return [];
        }
    },

    async getPostsByCategory(category: string) {
        try {
            const response = await databases.listDocuments<BlogPost>(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('category', category),
                    Query.limit(10),
                    Query.orderDesc('publishedAt')
                ]
            );
            return response.documents.map(this.transformPost);
        } catch (error) {
            console.error(`Error fetching posts for category ${category}:`, error);
            return [];
        }
    },

    // Helper to safely parse JSON fields that might come as strings
    transformPost(doc: BlogPost): BlogPost {
        let parsedTags = doc.tags;
        let parsedPremiumData = doc.premiumData;

        if (typeof doc.tags === 'string') {
            try {
                parsedTags = JSON.parse(doc.tags);
            } catch (e) {
                parsedTags = []; // Fallback
            }
        }

        if (typeof doc.premiumData === 'string') {
            try {
                parsedPremiumData = JSON.parse(doc.premiumData);
            } catch (e) {
                parsedPremiumData = null;
            }
        }

        return {
            ...doc,
            tags: Array.isArray(parsedTags) ? parsedTags : [],
            premiumData: parsedPremiumData
        };
    }
};
