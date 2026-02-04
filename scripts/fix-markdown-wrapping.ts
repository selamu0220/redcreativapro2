
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
    console.log('Fetching posts to check for markdown wrapping...');
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content');

    if (!posts) return;

    let count = 0;

    for (const post of posts) {
        let content = post.content || '';
        let originalContent = content;
        let changed = false;

        // Check for ```markdown or ``` at the start
        const trimmed = content.trim();
        if (trimmed.startsWith('```')) {
            // Remove first line
            const lines = trimmed.split('\n');
            if (lines.length > 0 && lines[0].startsWith('```')) {
                lines.shift(); // Remove first line (```markdown)

                // Remove last line if it is ```
                if (lines.length > 0 && lines[lines.length - 1].trim() === '```') {
                    lines.pop();
                }

                content = lines.join('\n').trim();
                changed = true;
            }
        }

        if (changed) {
            console.log(`Fixing wrapping for: ${post.slug}`);
            const { error } = await supabase
                .from('blog_posts')
                .update({ content })
                .eq('id', post.id);

            if (error) console.error(error);
            else count++;
        }
    }

    console.log(`Fixed ${count} posts.`);
}

run();
