
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function countPosts() {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('language, count');

    // The above query is not valid for grouping in supabase-js easily without .rpc or strictly typed mess.
    // Simpler: just get all languages and count in JS (assuming not thousands of posts yet)

    const { data: posts, error: fetchError } = await supabase
        .from('blog_posts')
        .select('language');

    if (fetchError) {
        console.error(fetchError);
        return;
    }

    const counts: Record<string, number> = {};
    posts?.forEach(p => {
        const lang = p.language || 'null';
        counts[lang] = (counts[lang] || 0) + 1;
    });

    console.log('Blog Post Counts by Language:', counts);
}

countPosts();
