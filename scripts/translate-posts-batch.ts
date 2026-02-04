import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { translateText, SupportedLanguage } from '../app/lib/translator';

const targetLanguages: SupportedLanguage[] = ['en', 'fr', 'de', 'it', 'pt'];

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_redcreativapro2_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🚀 Starting batch translation (Parallel per post)...');

    // 1. Fetch Source Posts (ES)
    const { data: sourcePosts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('language', 'es')
        .order('created_at', { ascending: false }); // Newest first

    if (error || !sourcePosts) {
        console.error('Error fetching source posts:', error);
        return;
    }

    console.log(`Found ${sourcePosts.length} source posts (ES).`);

    // Process each post
    for (const post of sourcePosts) {
        console.log(`\n📦 Processing: "${post.title}" (ID: ${post.id})`);

        if (!post.translation_group_id) {
            console.warn('⚠️ Skipping post without translation_group_id');
            continue;
        }

        // 2. Check existing translations for this group
        const { data: existingTranslations } = await supabase
            .from('blog_posts')
            .select('language')
            .eq('translation_group_id', post.translation_group_id);

        const existingLangs = new Set(existingTranslations?.map(t => t.language) || []);

        // 3. Translate for missing languages (Parallel)
        await Promise.all(targetLanguages.map(async (lang) => {
            if (existingLangs.has(lang)) {
                return;
            }

            console.log(`  - [${lang}] Translating...`);

            try {
                // Translate fields
                const [title, excerpt, seo_title, seo_description] = await Promise.all([
                    translateText(post.title, lang, 'Blog Post Title'),
                    translateText(post.excerpt || '', lang, 'Blog Post Excerpt'),
                    translateText(post.seo_title || post.title, lang, 'SEO Title'),
                    translateText(post.seo_description || post.excerpt || '', lang, 'SEO Description')
                ]);

                // Translate content separately
                const content = await translateText(post.content || '', lang, 'Blog Post Content (Markdown)');

                const newSlug = `${post.slug}-${lang}`;

                const newPost = {
                    ...post,
                    id: undefined,
                    language: lang,
                    slug: newSlug,
                    title,
                    excerpt,
                    content,
                    seo_title,
                    seo_description,
                    translation_group_id: post.translation_group_id,
                    created_at: post.created_at,
                    updated_at: new Date().toISOString()
                };
                delete newPost.id;

                const { error: insertError } = await supabase
                    .from('blog_posts')
                    .insert(newPost);

                if (insertError) {
                    console.error(`  ❌ Failed to insert [${lang}]:`, insertError.message);
                } else {
                    console.log(`  ✅ Created [${lang}] version.`);
                }

            } catch (err) {
                console.error(`  ❌ Translation failed for [${lang}]:`, err);
            }
        }));
    }
}

main().catch(console.error);
