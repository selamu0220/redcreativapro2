require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_redcreativapro2_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyColumn() {
    console.log('Verifying translation_group_id column...');

    // Try to select the column. If it doesn't exist, Supabase API usually ignores it or returns error depending on setup, 
    // but selecting it explicitly is a good test.
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, translation_group_id')
        .limit(1);

    if (error) {
        console.error('Error or column missing:', error.message);
        // Hint: 'Could not find the function...' or 'Column does not exist' usually comes as 400 or PostgrestError
    } else {
        console.log('Success! Column likely exists.');
        if (data && data.length > 0) {
            console.log('Sample data:', data[0]);
        }
    }
}

verifyColumn();
