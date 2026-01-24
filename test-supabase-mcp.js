
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kfxfygxavexlgmskotsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeGZ5Z3hhdmV4bGdtc2tvdHNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcwMzQ2MSwiZXhwIjoyMDgyMjc5NDYxfQ.gYL5Due-ibPbbI2O0PBQ4mX0TGHVznnpF2IjrpBE3D8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
    console.log('--- Supabase Connection Test ---');

    // List tables (indirectly by fetching one)
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title')
        .limit(5);

    if (error) {
        console.error('Error fetching blog_posts:', error);
    } else {
        console.log('Successfully fetched blog_posts:', data.length, 'rows');
        data.forEach(post => console.log(`- ${post.title}`));
    }

    // Check storage
    const { data: buckets, error: storageError } = await supabase
        .storage
        .listBuckets();

    if (storageError) {
        console.error('Error listing buckets:', storageError);
    } else {
        console.log('Successfully fetched buckets:', buckets.map(b => b.name));
    }
}

checkSupabase();
