require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

// Global kill switch for TLS rejection (Brute force fix for self-signed in dev/scripts)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function migrate() {
    console.log('🔗 Connecting to Supabase Postgres...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('❌ Missing POSTGRES_URL in .env.local');
        process.exit(1);
    }

    // Remove sslmode from query if present to avoid conflicts with explicit config
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully.');

        // ALTER TABLE to add language column if it doesn't exist
        const sql = `
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'language') THEN 
                    ALTER TABLE blog_posts ADD COLUMN language TEXT DEFAULT 'en'; 
                    RAISE NOTICE 'Added language column';
                ELSE 
                    RAISE NOTICE 'Language column already exists';
                END IF; 
            END $$;
        `;

        console.log('⚡ Executing Migration...');
        await client.query(sql);

        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Error applying migration:', err);
    } finally {
        await client.end();
    }
}

migrate();
