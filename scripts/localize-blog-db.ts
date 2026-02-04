
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY,
    baseURL: (process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY) ? "https://openrouter.ai/api/v1" : undefined
});

const TARGET_LANGS = ['es', 'fr', 'de', 'it', 'pt'];

async function translateText(text: string, targetLang: string, context: string = ''): Promise<string> {
    if (!text) return '';
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are a professional translator. Translate the following text to ${targetLang}. ${context} Return ONLY the translated string.` },
                { role: "user", content: text }
            ],
            model: "gpt-4o",
        });
        return completion.choices[0].message.content?.trim() || text;
    } catch (e) {
        console.error(`Error translating to ${targetLang}:`, e);
        return text;
    }
}

async function main() {
    console.log("🚀 Starting Blog DB Localization...");

    // 1. Fetch original posts (language is 'en' or NULL)
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .or('language.eq.en,language.is.null');

    if (error) {
        console.error("Error fetching posts:", error);
        return;
    }

    console.log(`Found ${posts.length} original posts to localize.`);

    for (const post of posts) {
        console.log(`\nProcessing: ${post.title} (${post.slug})`);

        // Ensure original has language set to 'en' if null
        if (!post.language) {
            await supabase.from('blog_posts').update({ language: 'en' }).eq('id', post.id);
            console.log("  Updated original to 'en'");
        }

        for (const lang of TARGET_LANGS) {
            // Check if translation exists
            // We assume translated slug will be stored in a way we can find, OR we just check if any post with language=lang exists 
            // BUT how do we link them? Usually we share a `translation_group_id` or similar. 
            // If we don't have that, we can assume if we find a post with same title-ish?
            // BETTER: We just blindly translate and insert, checking if slug collision.
            // But if we run this script twice, we duplicate.
            // Let's use metadata or slug pattern. 
            // We'll append `-${lang}` to slug for uniqueness and traceability.

            const targetSlug = `${post.slug}-${lang}`;

            const { data: existing } = await supabase
                .from('blog_posts')
                .select('id')
                .eq('slug', targetSlug)
                .single();

            if (existing) {
                console.log(`  Skipping ${lang} (already exists: ${targetSlug})`);
                continue;
            }

            console.log(`  Translating to ${lang}...`);

            const title = await translateText(post.title, lang);
            const excerpt = await translateText(post.excerpt, lang);
            // Translate content - simplify for demo/speed if content is huge, but user wants real quality
            // We'll translate the first 4000 chars if it's too long to save costs/time in this quick script, 
            // OR fully translate. Let's do full but in chunks if needed? 
            // GPT-4o supports large context.
            const content = await translateText(post.content, lang, "Keep markdown formatting. This is a blog post.");

            const newPost = {
                ...post,
                id: undefined, // Let DB generate ID
                created_at: new Date().toISOString(), // New timestamps
                updated_at: new Date().toISOString(),
                language: lang,
                slug: targetSlug,
                title,
                excerpt,
                content,
                published_at: post.published_at // Keep same publish date? Or new? Keep same.
            };

            const { error: insertError } = await supabase
                .from('blog_posts')
                .insert(newPost);

            if (insertError) {
                console.error(`  ❌ Error inserting ${lang}:`, insertError.message);
            } else {
                console.log(`  ✅ Created ${lang} version: ${targetSlug}`);
            }
        }
    }
}

main();
