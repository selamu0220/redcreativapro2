require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function updateSchema() {
    console.log('🔄 Applying Community Schema Updates...');

    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    connectionString = connectionString.replace('sslmode=require', '');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Create Tables
        await client.query(`
      CREATE TABLE IF NOT EXISTS community_channels (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL,
        description text,
        owner_id text NOT NULL,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS community_messages (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        channel_id uuid REFERENCES community_channels(id) ON DELETE CASCADE,
        user_id text NOT NULL,
        content text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

        // Enable RLS
        await client.query(`
      ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
      ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
    `);

        // Create Policies (using DO blocks to handle if not exists, or just DROP IF EXISTS)
        // For simplicity in this script, we drop existing policies to recreate them ensuring update
        await client.query(`
      DROP POLICY IF EXISTS "Public read channels" ON community_channels;
      CREATE POLICY "Public read channels" ON community_channels FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Auth users create channels" ON community_channels;
      CREATE POLICY "Auth users create channels" ON community_channels FOR INSERT WITH CHECK (auth.role() = 'authenticated');

      DROP POLICY IF EXISTS "Owner delete channels" ON community_channels;
      CREATE POLICY "Owner delete channels" ON community_channels FOR DELETE USING (auth.uid()::text = owner_id);

      DROP POLICY IF EXISTS "Public read messages" ON community_messages;
      CREATE POLICY "Public read messages" ON community_messages FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Auth users send messages" ON community_messages;
      CREATE POLICY "Auth users send messages" ON community_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    `);

        // Realtime
        await client.query(`
      ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
      ALTER PUBLICATION supabase_realtime ADD TABLE community_channels;
    `);

        console.log('✅ Community Schema updated successfully!');
    } catch (err) {
        if (err.message.includes('already in publication')) {
            console.log('✅ Tables already in realtime publication.');
        } else {
            console.error('❌ Error updating schema:', err);
        }
    } finally {
        await client.end();
    }
}

updateSchema();
