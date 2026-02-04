
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
    console.log('Checking blog_posts schema...');

    // Insert a test row to see if 'language' column is accepted (if we can't query schema directly easily)
    // Or better, just select one row and see keys.
    const { data, error } = await supabase.from('blog_posts').select('*').limit(1);

    if (error) {
        console.error('Error selecting:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        console.log('Sample row:', data[0]);
    } else {
        console.log('No rows found. Attempting to list columns via inserting dummy data (transaction rolled back? no, just dry run logic)');
        // If empty, we can't see columns easily from SELECT *.
        // Try selecting specific 'language' column
        const { error: colError } = await supabase.from('blog_posts').select('language').limit(1);
        if (colError) {
            console.log("Column 'language' might NOT exist:", colError.message);
        } else {
            console.log("Column 'language' exists!");
        }
    }
}

checkSchema();
