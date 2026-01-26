
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { title, content_html, excerpt, status } = await request.json();

        if (!title || !content_html) {
            return NextResponse.json({ error: 'Falta título o contenido' }, { status: 400 });
        }

        // Use Authenticated Client
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
        }

        // Insert into 'posts'
        // Note: The 'posts' table must have RLS that allows authenticated users to insert.
        // If not, this might fail unless we allow it.
        // Assuming 'posts' has a policy "Enable insert for authenticated users" or specific authors.

        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    title,
                    content: content_html, // Ensure column name matches your Schema
                    excerpt,
                    status: status || 'draft',
                    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    author_id: user.id, // Good practice to link author
                    published_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            // Fallback: If 'author_id' column doesn't exist, try without it? 
            // Better to show the error so we know.
            return NextResponse.json({ error: error.message, hint: error.hint }, { status: 500 });
        }

        return NextResponse.json({ success: true, post: data });

    } catch (error: any) {
        console.error("Publish API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
