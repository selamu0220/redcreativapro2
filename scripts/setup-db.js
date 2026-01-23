const { Client } = require('pg');

// Credentials from mcp_config.json
const connectionString = "postgres://postgres.izqyerauwtnsmvslqrdp:Sgbnamecheap01%23@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

// SQL Schema Definition
const schemaSQL = `
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. USERS (Synced from Kinde)
-- Drop tables if they exist to ensure clean state (careful in production!)
-- For this setup, we'll use IF NOT EXISTS to be safe
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  kinde_id text unique not null,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. USER SETTINGS (Ajustes)
create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  theme text default 'system',
  language text default 'en',
  notifications_enabled boolean default true,
  marketing_emails boolean default false,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 3. COMMUNITIES (Comunidades)
create table if not exists public.communities (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  is_private boolean default false,
  owner_id uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. COMMUNITY MEMBERS
create table if not exists public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member', 
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

-- 5. DOCUMENTS
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null default 'Untitled',
  content jsonb,
  is_published boolean default false,
  published_slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. SUBSCRIPTIONS (Payments)
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  status text not null,
  provider text not null,
  provider_subscription_id text,
  provider_customer_id text,
  plan_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_users_kinde_id on public.users(kinde_id);
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_communities_slug on public.communities(slug);

`;

console.log('🚀 Starting Schema Migration...');

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Bypass self-signed cert error
    }
});

async function runMigration() {
    try {
        await client.connect();
        console.log('✅ Connected to DB');

        console.log('📦 Applying Schema...');
        await client.query(schemaSQL);
        console.log('✅ Schema applied successfully!');

        // Verification step
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('\n📊 Validating Tables:');
        const existingTables = res.rows.map(r => r.table_name);
        const requiredTables = ['users', 'user_settings', 'communities', 'community_members', 'documents', 'subscriptions'];

        let allGood = true;
        requiredTables.forEach(t => {
            if (existingTables.includes(t)) {
                console.log(`   ✅ Table '${t}' exists`);
            } else {
                console.log(`   ❌ Table '${t}' MISSING`);
                allGood = false;
            }
        });

        if (allGood) {
            console.log('\n✨ migration_complete: Backend is ready.');
        } else {
            console.error('\n⚠️ warning: Some tables were not created.');
        }

    } catch (err) {
        console.error('❌ Migration Error:', err);
    } finally {
        await client.end();
    }
}

runMigration();
