
create table if not exists blog_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  platform text not null,
  name text not null,
  site_url text,
  credentials jsonb,
  is_active boolean default true,
  last_used timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table blog_integrations enable row level security;

create policy "Users can view their own integrations"
  on blog_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
  on blog_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
  on blog_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
  on blog_integrations for delete
  using (auth.uid() = user_id);
