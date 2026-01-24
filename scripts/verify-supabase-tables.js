require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function listTables() {
    console.log('Checking tables in public schema...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('Tables found:');
        res.rows.forEach(row => console.log(` - ${row.table_name}`));

    } catch (err) {
        console.error('Error listing tables:', err);
    } finally {
        await client.end();
    }
}

listTables();
