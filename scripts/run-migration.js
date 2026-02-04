require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runMigration(filePath) {
    console.log(`Running migration: ${filePath}`);

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    if (!connectionString) {
        console.error('Error: POSTGRES_URL is not defined in .env.local');
        process.exit(1);
    }

    // Fix for Supabase transaction poolers if needed, but usually we want direct connection for DDL
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = fs.readFileSync(filePath, 'utf8');
        console.log('Executing SQL...');

        await client.query(sql);

        console.log('Migration executed successfully.');

    } catch (err) {
        console.error('Error executing migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Get file from command line args
const migrationFile = process.argv[2];
if (!migrationFile) {
    console.error('Please provide a migration file path.');
    console.log('Usage: node scripts/run-migration.js scripts/db-migrations/01_example.sql');
    process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), migrationFile);
if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
}

runMigration(absolutePath);
