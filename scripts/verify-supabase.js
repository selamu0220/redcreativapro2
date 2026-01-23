const { Client } = require('pg');

// Remove the sslmode query param to avoid conflict with the object config
const connectionString = "postgres://postgres.izqyerauwtnsmvslqrdp:Sgbnamecheap01%23@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

console.log('🔌 Connecting to Supabase (Attempt 3)...');

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkConnection() {
    try {
        await client.connect();
        console.log('✅ Connected successfully to Supabase DB!');

        // Query to list all generic tables in the public schema
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('\n📊 Found Public Tables:');
        if (res.rows.length === 0) {
            console.log('   (No public tables found)');
        } else {
            res.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }

        const versionRes = await client.query('SELECT version();');
        console.log(`\n🤖 Server Version: ${versionRes.rows[0].version}`);

    } catch (err) {
        console.error('❌ Connection Error:', err);
        if (err.message.includes('password')) {
            console.log('💡 Tip: Double check the password encoding (Sgbnamecheap01%23 vs Sgbnamecheap01#)');
        }
    } finally {
        await client.end();
    }
}

checkConnection();
