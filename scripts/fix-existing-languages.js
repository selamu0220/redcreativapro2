require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_redcreativapro2_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLanguages() {
    console.log('🔄 Starting language fix...');

    // 1. Fetch all posts that don't have a translation_group_id OR have 'en' language (assuming all current content is Spanish)
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Checking ${posts.length} posts...`);

    let updatedCount = 0;

    for (const post of posts) {
        const needsUpdate = !post.translation_group_id || post.language !== 'es';

        if (needsUpdate) {
            const updates = {};

            // Generate UUID if missing
            if (!post.translation_group_id) {
                updates.translation_group_id = uuidv4();
            }

            // Force language to 'es' if it's currently 'en' (legacy default)
            // We assume all existing content is Spanish based on user context
            if (post.language !== 'es') {
                updates.language = 'es';
            }

            const { error: updateError } = await supabase
                .from('blog_posts')
                .update(updates)
                .eq('id', post.id);

            if (updateError) {
                console.error(`Failed to update post ${post.id}:`, updateError.message);
            } else {
                console.log(`✅ Updated post: ${post.title} -> Group: ${updates.translation_group_id || 'exist'} | Lang: ${updates.language || 'exist'}`);
                updatedCount++;
            }
        }
    }

    console.log(`\n🎉 Finished. Updated ${updatedCount} posts.`);
}

fixLanguages();
