
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content_html, excerpt, status, category, tags, image, slug: customSlug, publishedAt } = body; // Updated destructuring

        console.log("Creating post:", { title, status, category }); // Debug log

        if (!title || !content_html) {
            return NextResponse.json({ error: 'Falta título o contenido' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth User Error:", authError);
            return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
        }

        // Calculate defaults
        const baseSlug = customSlug || title; // Use custom slug if provided
        const slug = baseSlug.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + (customSlug ? '' : '-' + Math.floor(Math.random() * 1000)); // Ensure uniqueness only if auto-generated

        const wordCount = content_html.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min lectura';

        const newPost = {
            title,
            content: content_html, // Correct column mapping
            excerpt: excerpt || content_html.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...',
            slug,
            image: image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000', // Default AI image
            category: category || 'Inteligencia Artificial', // Default category
            author: user.email?.split('@')[0] || 'Escritor IA',
            user_id: user.id, // REQUIRED for RLS Policy
            read_time: readTime,
            tags: tags || ['IA', 'Generado'],
            featured: false,
            trending: false,
            views: 0,
            likes: 0,
            published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('blog_posts') // Corrected table name
            .insert([newPost])
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 });
        }

        return NextResponse.json({ success: true, post: data });

    } catch (error: any) {
        console.error("Publish API Internal Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
