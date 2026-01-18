import { createAdminClient } from './server/appwrite';
import { Query } from 'node-appwrite';
import { blogPosts as staticPosts, BlogPost } from '@/lib/blog-data';

// Database and Collection IDs - ideally from env vars
const BLOG_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
const BLOG_COLLECTION_ID = process.env.APPWRITE_BLOG_COLLECTION_ID || 'blog_posts';

/**
 * Fetch blog posts from Appwrite Database
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        // Check if credentials exist before trying to connect
        if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.APPWRITE_API_KEY) {
            console.warn('Appwrite credentials not found, using static data for blog.');
            return staticPosts;
        }

        const { databases } = createAdminClient();

        /* 
           Try to fetch from Appwrite. 
           Wrap in try/catch specifically for the API call to fallback gracefully 
           if the collection doesn't exist yet.
        */
        try {
            const response = await databases.listDocuments(
                BLOG_DATABASE_ID,
                BLOG_COLLECTION_ID,
                [
                    Query.orderDesc('publishedAt'),
                    Query.limit(100) // Fetch top 100 posts
                ]
            );

            if (response.documents.length === 0) {
                console.log('No posts found in Appwrite, returning static data for preview.');
                // If strictly production and empty, return empty array? 
                // Better to return static content if it's a demo/starter template situation 
                // unless user explicitly wants empty.
                // Given the user said "no se ven los articulos", they probably expect SOMETHING.
                // But if they have their OWN articles in Appwrite, they want those.

                // Let's assume if collection exists but is empty, we return empty.
                // But if collection scan fails, we return static.
                return [];
            }

            // Map Appwrite documents to BlogPost interface
            const appwritePosts = response.documents.map(doc => {
                // Handle potential field variations
                const category = doc.category?.name || doc.category || 'General';
                // If category is an object/relation, try to get name/title, otherwise use string

                return {
                    id: doc.$id,
                    title: doc.title,
                    excerpt: doc.excerpt || doc.description || doc.summary || '',
                    content: doc.content || '',
                    category: typeof category === 'string' ? category : 'General',
                    subcategory: doc.subcategory || '',
                    author: doc.author || 'Red Creativa',
                    publishedAt: doc.publishedAt || doc.$createdAt,
                    readTime: doc.readTime || '5 min',
                    tags: doc.tags || [],
                    featured: doc.featured || false,
                    trending: doc.trending || false,
                    views: doc.views || 0,
                    likes: doc.likes || 0,
                    // Handle different image field names
                    image: doc.image || doc.cover_image || doc.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
                    seoTitle: doc.seoTitle,
                    seoDescription: doc.seoDescription,
                    slug: doc.slug // Ensure slug is captured if available
                } as any as BlogPost; // Cast to bypass strict interface matching for optional fields
            });

            return appwritePosts;

        } catch (apiError: any) {
            // Specifically check for "Collection not found" error
            if (apiError.code === 404) {
                console.warn(`Blog collection '${BLOG_COLLECTION_ID}' not found in Appwrite. Using static data.`);
                return staticPosts;
            }
            throw apiError;
        }

    } catch (error) {
        console.error('Error fetching blog posts service:', error);
        // Fallback to static data on error to prevent page crash
        return staticPosts;
    }
}

/**
 * Fetch a single blog post by ID or Slug
 */
export async function getBlogPost(idOrSlug: string): Promise<BlogPost | null> {
    // First try finding in static data (fastest)
    const staticPost = staticPosts.find(p => p.id === idOrSlug || (p as any).slug === idOrSlug);

    // If not in static, or if we want to prefer Appwrite, try Appwrite
    // For now, let's try Appwrite first if configured
    if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.APPWRITE_API_KEY) {
        try {
            const { databases } = createAdminClient();

            // Try fetching by ID
            try {
                const doc = await databases.getDocument(BLOG_DATABASE_ID, BLOG_COLLECTION_ID, idOrSlug);
                return mapDocToPost(doc);
            } catch (e) {
                // If not found by ID, try querying by slug
                const response = await databases.listDocuments(
                    BLOG_DATABASE_ID,
                    BLOG_COLLECTION_ID,
                    [Query.equal('slug', idOrSlug), Query.limit(1)]
                );

                if (response.documents.length > 0) {
                    return mapDocToPost(response.documents[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching single post from Appwrite:', error);
        }
    }

    return staticPost || null;
}

function mapDocToPost(doc: any): BlogPost {
    const category = doc.category?.name || doc.category || 'General';

    return {
        id: doc.$id,
        title: doc.title,
        excerpt: doc.excerpt || doc.description || '',
        content: doc.content || '',
        category: typeof category === 'string' ? category : 'General',
        subcategory: doc.subcategory || '',
        author: doc.author || 'Red Creativa',
        publishedAt: doc.publishedAt || doc.$createdAt,
        readTime: doc.readTime || '5 min',
        tags: doc.tags || [],
        featured: doc.featured || false,
        trending: doc.trending || false,
        views: doc.views || 0,
        image: doc.image || doc.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
    };
}
