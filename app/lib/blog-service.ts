
import { supabaseAdmin } from '@/app/lib/auth/supabase-admin';
import { STATIC_BLOG_POSTS } from '@/app/lib/static-blog-posts';
import { z } from 'zod';

// --- Zod Schemas for Strict Validation ---

// Schema for premium/custom data fields to ensure they are safe objects or arrays
const PremiumDataSchema = z.object({
    // Force these to be arrays. If they are objects/strings/null, coerce to null array (undefined)
    process: z.array(z.any()).optional().nullable().catch(null),
    promptsSection: z.array(z.any()).optional().nullable().catch(null),
    resourcesSection: z.array(z.any()).optional().nullable().catch(null),
    relatedLinks: z.array(z.any()).optional().nullable().catch(null),
    faqJsonLd: z.any().optional().nullable(),
}).passthrough();

// Main Blog Post Schema
const BlogPostSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.coerce.string().default('Untitled Post'),
    excerpt: z.coerce.string().default(''),
    content: z.any().transform((val) => {
        if (typeof val === 'string') return val;
        // Even if it's "Content coming soon..", it's a string, so safe.
        // If it's a weird object, kill it.
        return '';
    }),
    category: z.coerce.string().default('General'),
    author: z.coerce.string().default('Red Creativa'),
    read_time: z.coerce.string().default('5 min'), // Maps to readTime
    tags: z.array(z.string()).or(z.string().transform(s => [s])).default([]), // Handle array or single string
    image: z.string().nullable().optional(),
    seo_title: z.string().nullable().optional(),
    seo_description: z.string().nullable().optional(),
    featured: z.boolean().default(false),
    trending: z.boolean().default(false),
    views: z.number().default(0),
    likes: z.number().default(0),
    published_at: z.string().default(new Date().toISOString()),
    premium_data: PremiumDataSchema.optional().nullable(),
});

export type BlogPost = {
    id: string;
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
    process?: any[];
    promptsSection?: any[];
    resourcesSection?: any[];
    faqJsonLd?: any;
    relatedLinks?: any[];
    // Legacy support
    prompts?: string[];
    resources?: { name: string; href: string }[];
};

// Transform Row using Zod
function transformRowToPostStrict(row: any): BlogPost {
    // 1. Validate 'row' against schema (strips unknown, coerces types)
    const result = BlogPostSchema.safeParse(row);

    if (!result.success) {
        console.error('[BlogService] Zod Validation Failed for row:', row.id, result.error);
        // Fallback to a "safe" object wrapper around the raw row to try and savage what we can,
        // or re-throw if strictness is required. For now, we try to salvage.
        return {
            id: row.id || 'unknown',
            slug: row.slug || 'unknown',
            title: String(row.title || 'Error loading title'),
            excerpt: String(row.excerpt || ''),
            content: '', // Safety: empty content
            category: 'Error',
            author: 'System',
            readTime: '0 min',
            tags: [],
            featured: false,
            trending: false,
            views: 0,
            likes: 0,
            publishedAt: new Date().toISOString()
        };
    }

    const data = result.data;
    const premium = data.premium_data || {};

    return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: data.author,
        readTime: data.read_time,
        tags: data.tags,
        image: data.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
        seoTitle: data.seo_title || undefined,
        seoDescription: data.seo_description || undefined,
        featured: data.featured,
        trending: data.trending,
        views: data.views,
        likes: data.likes,
        publishedAt: data.published_at,
        process: premium.process,
        promptsSection: premium.promptsSection,
        resourcesSection: premium.resourcesSection,
        relatedLinks: premium.relatedLinks,
        faqJsonLd: premium.faqJsonLd,
    };
}

export async function getBlogPosts(limit = 100): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[BlogService] Supabase error:', error);
            // Fallback to static if DB fails
            return STATIC_BLOG_POSTS;
        }

        return (data || []).map(transformRowToPostStrict);

    } catch (err) {
        console.error('[BlogService] Unexpected error:', err);
        return STATIC_BLOG_POSTS;
    }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            console.warn(`[BlogService] Post not found in DB: ${slug}`);
            // Check static fallback
            return STATIC_BLOG_POSTS.find(p => p.slug === slug) || null;
        }

        return transformRowToPostStrict(data);
    } catch (err) {
        console.error(`[BlogService] Error fetching post ${slug}:`, err);
        return STATIC_BLOG_POSTS.find(p => p.slug === slug) || null;
    }
}

// Keep existing helper functions but utilizing the strict transform
export async function getFeaturedPosts(): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .eq('featured', true)
            .order('published_at', { ascending: false })
            .limit(6);

        if (error) return STATIC_BLOG_POSTS.filter(p => p.featured);
        return (data || []).map(transformRowToPostStrict);
    } catch {
        return STATIC_BLOG_POSTS.filter(p => p.featured);
    }
}

export async function getRelatedPosts(currentPostId: string, limit = 3): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .neq('id', currentPostId)
            .order('views', { ascending: false })
            .limit(limit);

        if (error) return STATIC_BLOG_POSTS.slice(0, limit);

        return (data || []).map(transformRowToPostStrict);
    } catch {
        return STATIC_BLOG_POSTS.slice(0, limit);
    }
}
