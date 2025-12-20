
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local AND .env
const envLocal = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const envMain = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function migrate() {
    // Debug loaded envs (keys only)
    console.log('Environment keys loaded:', [
        ...Object.keys(envLocal.parsed || {}),
        ...Object.keys(envMain.parsed || {})
    ].filter(k => k.includes('URL') || k.includes('KEY')));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing Supabase environment variables (URL/KEY)');
    }

    if (process.env.DATABASE_URL) {
        console.log('🔌 Using pg client with DATABASE_URL...');
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        try {
            const client = await pool.connect();
            try {
                console.log('⬇️ Dropping foreign key constraint...');
                await client.query('ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey');

                console.log('📝 Changing user_id column type to TEXT...');
                await client.query('ALTER TABLE documents ALTER COLUMN user_id TYPE text');

                console.log('⬇️ Dropping folders foreign key constraint (if exists)...');
                await client.query('ALTER TABLE folders DROP CONSTRAINT IF EXISTS folders_user_id_fkey');

                console.log('✅ Migration completed successfully via pg client.');
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('❌ Migration failed:', err);
        }
        await pool.end();
        return;
    }

    console.error('❌ DATABASE_URL not found in .env files. Cannot run migration.');
}

migrate();
