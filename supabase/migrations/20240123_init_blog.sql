
-- Create tables for Blog and Documents

-- 1. Blog Posts Table
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  image text,
  category text default 'General',
  subcategory text,
  author text default 'Red Creativa',
  read_time text default '5 min',
  tags jsonb default '[]'::jsonb,
  premium_data jsonb default '{}'::jsonb, -- Stores process, prompts, resources
  featured boolean default false,
  trending boolean default false,
  views integer default 0,
  likes integer default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table blog_posts enable row level security;

-- Policies for Blog Posts
-- Public read access
create policy "Allow public read access" on blog_posts
  for select using (true);

-- Admin write access (assuming service role for now, or authenticated admin)
-- For simplicity in this migration, we'll allow service role (server-side) full access implicitly.
-- If we need authenticated user edits later, we add policies here.

-- 2. User Documents Table (Migration from Appwrite structure)
create table if not exists user_documents (
  id uuid default gen_random_uuid() primary key,
  owner_id text not null, -- Mapping to user ID (from Supabase Auth or external)
  title text,
  content text,
  mode text,
  language text,
  pre_prompt text,
  context text,
  group_id uuid, -- Foreign key to groups if needed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_documents enable row level security;

create policy "Users can CRUD their own documents" on user_documents
  for all using (auth.uid()::text = owner_id);

-- Indexes
create index if not exists idx_blog_slug on blog_posts(slug);
create index if not exists idx_blog_published on blog_posts(published_at desc);
create index if not exists idx_docs_owner on user_documents(owner_id);
