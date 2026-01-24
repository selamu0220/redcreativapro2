require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Key prefix:', key ? key.substring(0, 15) + '...' : 'undefined');

if (!url || !key) {
    console.error('Missing URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    try {
        // Try to get session (doesn't require db access usually)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Auth Session Error:', sessionError.message);
        } else {
            console.log('Auth Connection Successful! Session retrieved.');
        }

        // Try a simple select from a common table if possible, or just check health
        // Since we don't know the schema, getting the session is a good connectivity check for the project itself.
        // We can also try getting system config if exposed, but auth is safest 'public' endpoint.

    } catch (err) {
        console.error('Unexpected script error:', err);
    }
}

test();
