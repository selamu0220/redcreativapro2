
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import OpenAI from 'openai';

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://redcreativa.pro", // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "Red Creativa Pro", // Optional. Shows in rankings on openrouter.ai.
    }
});

const POSTS_FILE = 'short-posts.json';

async function generateContent(title: string) {
    console.log(`Generating content for: "${title}"...`);

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert copywriter for Red Creativa Pro. Write a comprehensive, engaging, and SEO-optimized blog post in Spanish (Español) based on the title provided. Return ONLY the Markdown content. Use H2, H3, bullet points, and bold text for emphasis. The tone should be professional, innovative, and authoritative. Length: ~800-1200 words." },
                { role: "user", content: `Title: ${title}` }
            ],
            model: "openai/gpt-4o-mini",
        });

        let content = completion.choices[0].message.content || '';

        // Strip markdown code fences if present
        content = content.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

        return content;
    } catch (e) {
        console.error('Error generating AI content:', e);
        return null;
    }
}

async function run() {
    if (!fs.existsSync(POSTS_FILE)) {
        console.error('short-posts.json not found');
        return;
    }

    const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    console.log(`Loaded ${posts.length} posts to restore.`);

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        // Check if already restored (idempotency)
        const { data: current } = await supabase
            .from('blog_posts')
            .select('content')
            .eq('id', post.id)
            .single();

        if (current?.content && current.content.length > 500) {
            console.log(`[${i + 1}/${posts.length}] Skipping ${post.slug} (already restored).`);
            continue;
        }

        console.log(`[${i + 1}/${posts.length}] Processing ${post.slug}...`);


        const newContent = await generateContent(post.title);

        if (newContent) {
            const { error } = await supabase
                .from('blog_posts')
                .update({
                    content: newContent,
                    read_time: '6 min read', // approximate
                    updated_at: new Date().toISOString()
                })
                .eq('id', post.id);

            if (error) {
                console.error(`Failed to update DB for ${post.slug}:`, error);
            } else {
                console.log(`✅ Updated ${post.slug}`);
            }
        }

        // Delay to be nice to rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('--- Restoration Complete ---');
}

run();
