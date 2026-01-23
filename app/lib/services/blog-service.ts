export interface BlogPost {
    $id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    readTime: string;
    tags: string[];
    image?: string;
    seoTitle?: string;
    seoDescription?: string;
    featured: boolean;
    trending: boolean;
    views: number;
    likes: number;
    publishedAt: string;
    premiumData?: any;
}

export const blogService = {
    async getAllPosts(limit = 10, offset = 0) {
        return { documents: [], total: 0 };
    },

    async getPostBySlug(slug: string) {
        return null;
    },

    async getFeaturedPosts() {
        return [];
    },

    async getRecentPosts(limit = 5) {
        return [];
    },

    async getPostsByCategory(category: string) {
        return [];
    },

    transformPost(doc: BlogPost): BlogPost {
        let parsedTags = doc.tags;
        let parsedPremiumData = doc.premiumData;

        if (typeof doc.tags === 'string') {
            try {
                parsedTags = JSON.parse(doc.tags as any);
            } catch (e) {
                parsedTags = [];
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
