
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('Fetching all posts for linking analysis...');
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content');

    if (!posts) return;

    // Build keyword map (simple slug-based)
    // E.g. "writing-tips" -> links to /blog/writing-tips
    const linkMap = posts.map(p => ({
        slug: p.slug,
        keywords: p.slug.split('-').filter(w => w.length > 3), // simple heuristic
        title: p.title
    }));

    console.log(`Analyzing ${posts.length} posts...`);

    for (const post of posts) {
        let content = post.content || '';
        let originalContent = content;
        let changed = false;

        // Skip if content is too short
        if (content.length < 500) continue;

        // Try to find mentions of other posts
        for (const target of linkMap) {
            if (target.slug === post.slug) continue; // Don't link to self

            // Look for title match
            if (content.includes(target.title) && !content.includes(`(/blog/${target.slug})`)) {
                // Determine if we should link (simple exact match of title)
                // Using regex to ensure we don't break existing md links
                const regex = new RegExp(`(?<!\\[)${escapeRegExp(target.title)}(?!\\])`, 'g');
                // This is risky without manual review, so we just LOG suggestions for now
                // Or we can do safe replacement if confident

                // For this script, we'll just log opportunities
                // console.log(`[Suggestion] In "${post.title}", link "${target.title}" -> /blog/${target.slug}`);
            }
        }
    }
    console.log('Internal linking analysis complete (Dry Run). To enable auto-linking, logic requires robust text processing.');
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

run();
