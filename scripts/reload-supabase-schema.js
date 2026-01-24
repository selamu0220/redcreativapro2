require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function reloadSchema() {
    console.log('🔄 Reloading PostgREST Schema Cache...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Command to reload Supabase API schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('✅ Schema reload signal sent!');
    } catch (err) {
        console.error('❌ Error reloading schema:', err);
    } finally {
        await client.end();
    }
}

reloadSchema();
