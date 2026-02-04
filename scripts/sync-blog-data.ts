
import { createClient } from '@supabase/supabase-js';
import { blogPosts } from '../lib/blog-data';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function sync() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for writes!

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase Environment Variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Syncing ${blogPosts.length} posts...`);

    for (const post of blogPosts) {
        console.log(`Upserting ${post.title}...`);

        // Map fields if necessary, or just upsert if schema matches
        // Note: blog-data.ts uses camelCase, Supabase likely snake_case
        // We need to map it.
        const dbPost = {
            slug: post.id, // ID is used as slug in blog-data usually?
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            image: post.image,
            category: post.category,
            author: post.author,
            read_time: post.readTime,
            tags: post.tags,
            featured: post.featured || false,
            trending: post.trending || false,
            views: post.views || 0,
            published_at: post.publishedAt,
            // created_at: undefined // let DB handle defaults
        };

        const { error } = await supabase
            .from('blog_posts')
            .upsert(dbPost, { onConflict: 'slug' });

        if (error) {
            console.error(`Error syncing ${post.title}:`, error);
        } else {
            console.log(`✅ Synced ${post.title}`);
        }
    }
}

sync();
