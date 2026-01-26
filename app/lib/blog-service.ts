
import { createClient } from '@/app/lib/supabase/client';

export interface BlogPost {
    id: string; // UUID in Supabase
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

    // Premium Data / Custom Fields
    // In Supabase, these are stored in the 'premium_data' JSONB column
    // We map them to top-level properties for the UI
    process?: any[];
    promptsSection?: any[];
    resourcesSection?: any[];
    faqJsonLd?: any;
    relatedLinks?: any[];

    // Legacy support
    prompts?: string[];
    resources?: { name: string; href: string }[];
}

// Transform Supabase Row to BlogPost
function transformRowToPost(row: any): BlogPost {
    const premiumData = row.premium_data || {};

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        category: row.category,
        author: row.author,
        readTime: row.read_time, // Note snake_case from DB
        tags: row.tags || [],
        image: row.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        featured: row.featured,
        trending: row.trending,
        views: row.views,
        likes: row.likes,
        publishedAt: row.published_at,

        // Map premium_data to top level
        process: premiumData.process,
        promptsSection: premiumData.promptsSection,
        resourcesSection: premiumData.resourcesSection,
        relatedLinks: premiumData.relatedLinks,
        faqJsonLd: premiumData.faqJsonLd,
    };
}

export async function getBlogPosts(limit = 100): Promise<BlogPost[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[BlogService] Error fetching posts:', error);
        return [];
    }

    return (data || []).map(transformRowToPost);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`[BlogService] Error fetching post ${slug}:`, error);
        return null;
    }

    return data ? transformRowToPost(data) : null;
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('[BlogService] Error fetching featured posts:', error);
        return [];
    }

    return (data || []).map(transformRowToPost);
}

export async function getRelatedPosts(currentPostId: string, limit = 3): Promise<BlogPost[]> {
    const supabase = createClient();

    // Fetch posts, excluding current one
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('id', currentPostId) // or .neq('slug', currentSlug) if ID not available
        .order('views', { ascending: false })
        .limit(limit);

    if (error) return [];

    return (data || []).map(transformRowToPost);
}
