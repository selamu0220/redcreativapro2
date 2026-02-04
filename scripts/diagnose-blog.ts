
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Force load env vars from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- Starting Blog Diagnosis ---');

    // 1. Count total posts
    const { count, error: countError } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting posts:', countError);
        return;
    }
    console.log(`Total Posts: ${count}`);

    // 2. Find empty content
    // "Empty" could be null, empty string, or very short string
    const { data: allPosts, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, published_at');

    if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        return;
    }

    const emptyPosts = [];
    const shortPosts = [];
    const htmlPosts = [];
    const jsonPosts = [];
    const markdownPosts = [];

    allPosts.forEach(post => {
        const content = post.content || '';

        if (!content || content.trim().length === 0) {
            emptyPosts.push({ id: post.id, title: post.title, slug: post.slug });
        } else if (content.length < 200) {
            shortPosts.push({ id: post.id, title: post.title, slug: post.slug, length: content.length });
        }

        // Guess format
        if (content.trim().startsWith('{') && content.includes('"type":')) {
            jsonPosts.push(post.id);
        } else if (content.includes('<div') || content.includes('<p>')) {
            htmlPosts.push(post.id);
        } else {
            markdownPosts.push(post.id);
        }
    });

    console.log('\n--- Diagnosis Results ---');
    console.log(`Empty Posts: ${emptyPosts.length}`);
    console.log(`Short Posts (<200 chars): ${shortPosts.length}`);
    console.log(`JSON (Tiptap) Format: ${jsonPosts.length}`);
    console.log(`HTML Format: ${htmlPosts.length}`);
    console.log(`Markdown/Text Format: ${markdownPosts.length}`);

    if (emptyPosts.length > 0) {
        console.log('\n--- Empty Posts (First 10) ---');
        console.table(emptyPosts.slice(0, 10));
        fs.writeFileSync('empty-posts-report.json', JSON.stringify(emptyPosts, null, 2));
        console.log('Saved full list to empty-posts-report.json');
    }

    if (shortPosts.length > 0) {
        console.log('\n--- Short Posts (First 5) ---');
        console.table(shortPosts.slice(0, 5));
    }
}

diagnose();
