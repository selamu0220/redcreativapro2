
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function migrate() {
    console.log("Connecting to database...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected. Adding 'language' column...");

        await client.query(`
            ALTER TABLE blog_posts 
            ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
        `);
        console.log("✅ Column 'language' added or verified.");

        const updateRes = await client.query(`
            UPDATE blog_posts 
            SET language = 'en' 
            WHERE language IS NULL;
        `);
        console.log(`✅ Updated ${updateRes.rowCount} rows to default language 'en'.`);

    } catch (e) {
        console.error("❌ Migration failed:", e);
    } finally {
        await client.end();
        console.log("Disconnected.");
    }
}

migrate();
