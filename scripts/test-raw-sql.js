require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testRawSql() {
    console.log('🧪 Testing Raw SQL Table Access...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Check if table exists in information_schema
        const res = await client.query("SELECT * FROM community_channels LIMIT 1;");

        console.log('✅ Raw SQL Query Successful!');
        console.log('Rows found:', res.rows.length);

    } catch (err) {
        console.error('❌ Raw SQL Failed:', err);
    } finally {
        await client.end();
    }
}

testRawSql();
