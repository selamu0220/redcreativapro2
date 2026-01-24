require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const seedPath = 'c:\\Users\\programar\\Documents\\GitHub\\redcreativapro2\\supabase\\seed.sql';

async function seedDatabase() {
    console.log('🌱 Seeding Database...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log(`📖 Reading seed file: ${seedPath}`);
        const sql = fs.readFileSync(seedPath, 'utf8');

        console.log('⚡ Executing Seed...');
        await client.query(sql);

        console.log('✅ Database seeded successfully!');
    } catch (err) {
        if (err.code === '23505') {
            console.log('⚠️ Seed data already exists (Duplicate Key Error). Skipping.');
        } else {
            console.error('❌ Error seeding database:', err);
        }
    } finally {
        await client.end();
    }
}

seedDatabase();
