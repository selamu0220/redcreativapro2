

import { supabaseAdmin } from '@/app/lib/auth/supabase-admin';
import { STATIC_BLOG_POSTS } from '@/app/lib/static-blog-posts';

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
    try {
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
    } catch (error) {
        console.error('[BlogService] Error transforming row:', error, row);
        throw error;
    }
}

export async function getBlogPosts(limit = 100): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[BlogService] Error fetching posts (using static fallback):', error);
            // Fallback to static posts
            return STATIC_BLOG_POSTS;
        }

        const posts = (data || []).map(transformRowToPost);
        return posts.length > 0 ? posts : STATIC_BLOG_POSTS;

    } catch (err) {
        console.error('[BlogService] Unexpected error in getBlogPosts (using static fallback):', err);
        return STATIC_BLOG_POSTS;
    }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
        // First try finding in static posts to avoid DB call if it's a known static one (optimization/fallback hybrid)
        // Actually, prefer DB always, fallback only on error.

        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            // Check static fallback
            console.warn(`[BlogService] Error fetching post ${slug} from DB. Checking static fallback. Error:`, error);
            const staticPost = STATIC_BLOG_POSTS.find(p => p.slug === slug);
            if (staticPost) {
                // Determine missing content buffer
                if (!staticPost.content || staticPost.content.length < 50) {
                    staticPost.content = `
                        <h2>${staticPost.title}</h2>
                        <p>${staticPost.excerpt}</p>
                        <p><em>(Contenido completo próximamente - Mostrando versión estática de emergencia)</em></p>
                     `;
                }
                return staticPost;
            }
            return null;
        }

        return data ? transformRowToPost(data) : null;
    } catch (err) {
        console.error(`[BlogService] Unexpected error in getBlogPost(${slug}):`, err);
        const staticPost = STATIC_BLOG_POSTS.find(p => p.slug === slug);
        if (staticPost) {
            if (!staticPost.content || staticPost.content.length < 50) {
                staticPost.content = `
                    <h2>${staticPost.title}</h2>
                    <p>${staticPost.excerpt}</p>
                    <p><em>(Contenido recuperado del sistema de respaldo)</em></p>
                 `;
            }
            return staticPost;
        }
        return null;
    }
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .eq('featured', true)
            .order('published_at', { ascending: false })
            .limit(6);

        if (error) {
            console.error('[BlogService] Error fetching featured posts:', error);
            return STATIC_BLOG_POSTS.filter(p => p.featured);
        }

        const posts = (data || []).map(transformRowToPost);
        return posts.length > 0 ? posts : STATIC_BLOG_POSTS.filter(p => p.featured);
    } catch (err) {
        console.error('[BlogService] Unexpected error in getFeaturedPosts:', err);
        return STATIC_BLOG_POSTS.filter(p => p.featured);
    }
}

export async function getRelatedPosts(currentPostId: string, limit = 3): Promise<BlogPost[]> {
    try {
        // Fetch posts, excluding current one
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .neq('id', currentPostId) // or .neq('slug', currentSlug) if ID not available
            .order('views', { ascending: false })
            .limit(limit);

        if (error) return STATIC_BLOG_POSTS.slice(0, limit);

        return (data || []).map(transformRowToPost);
    } catch (err) {
        console.error('[BlogService] Unexpected error in getRelatedPosts:', err);
        return STATIC_BLOG_POSTS.slice(0, limit);
    }
}
