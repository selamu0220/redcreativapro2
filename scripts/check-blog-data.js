require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_redcreativapro2_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking blog_posts data...');

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} posts.`);
    data.forEach(post => {
        console.log(`- ID: ${post.id}, Lang: ${post.language}, Slug: ${post.slug}, Title: ${post.title}`);
        // Log keys to infer schema
        console.log('  Keys:', Object.keys(post).join(', '));
    });
}

checkData();
