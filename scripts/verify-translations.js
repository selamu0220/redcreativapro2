require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_redcreativapro2_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('🔍 Verifying translations...');

    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, language, translation_group_id, title')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    const groups = {};
    data.forEach(p => {
        if (!groups[p.translation_group_id]) {
            groups[p.translation_group_id] = [];
        }
        groups[p.translation_group_id].push(p.language);
    });

    console.log(`Found ${Object.keys(groups).length} groups in recent posts.`);

    Object.keys(groups).forEach(gid => {
        const langs = groups[gid].sort();
        const title = data.find(p => p.translation_group_id === gid && p.language === 'es')?.title || 'Unknown Title';
        const isComplete = langs.length >= 6; // es, en, fr, de, it, pt

        console.log(`\nGroup: ${gid} ("${title.substring(0, 30)}...")`);
        console.log(`  Languages: [${langs.join(', ')}]`);
        console.log(`  Status: ${isComplete ? '✅ COMPLETE' : '⏳ PARTIAL'}`);
    });
}

verify();
