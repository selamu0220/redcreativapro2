
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGroup() {
    const groupId = '1e3850e2-66c2-4dcb-8fce-b98a89622796';
    console.log(`Checking group: ${groupId}`);

    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, language, slug')
        .eq('translation_group_id', groupId);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log('Posts found:', data);
}

checkGroup();
