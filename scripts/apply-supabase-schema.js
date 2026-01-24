require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const schemaPath = 'c:\\Users\\programar\\.gemini\\antigravity\\brain\\9a727e89-13f6-4b61-b11c-579a9be29aa7\\supabase_schema.sql';

// Global kill switch for TLS rejection (Brute force fix for self-signed in dev/scripts)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function applySchema() {
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

        console.log(`📖 Reading schema from: ${schemaPath}`);
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('⚡ Executing Schema...');
        await client.query(sql);

        console.log('✅ Schema applied successfully!');
    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        await client.end();
    }
}

applySchema();
