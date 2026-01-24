require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function updateSchema() {
    console.log('🔄 Applying Schema Updates...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Add columns if they don't exist
        await client.query(`
      ALTER TABLE user_documents ADD COLUMN IF NOT EXISTS category text;
      ALTER TABLE user_documents ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE user_documents ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
    `);

        console.log('✅ Schema updated successfully!');
    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
