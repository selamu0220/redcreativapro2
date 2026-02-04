require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function inspectTable(tableName) {
    console.log(`Inspecting table: ${tableName}`);

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    if (!connectionString) {
        console.error('Error: POSTGRES_URL not found in .env.local');
        return;
    }
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position;
        `, [tableName]);

        console.log('Columns:');
        res.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));

    } catch (err) {
        console.error('Error inspecting table:', err);
    } finally {
        await client.end();
    }
}

inspectTable('blog_posts');
