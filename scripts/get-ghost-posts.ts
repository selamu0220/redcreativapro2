
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Force load env vars
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('Fetching short posts...');
    const { data: allPosts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content');

    const shortPosts = (allPosts || []).filter(p => !p.content || p.content.length < 200);

    console.log(`Found ${shortPosts.length} short posts.`);
    fs.writeFileSync('short-posts.json', JSON.stringify(shortPosts, null, 2));
    console.log('Saved to short-posts.json');
}

run();
