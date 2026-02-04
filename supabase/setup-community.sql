-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create 'channels' table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'public', -- 'public', 'private', 'announcement'
    created_by TEXT, -- Stores 'system' or user ID (as text or uuid depending on auth system, using text for flexibility)
    owner_id UUID REFERENCES auth.users(id), -- Optional link to auth.users if created by a user
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create 'messages' table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable if user is deleted
    content TEXT NOT NULL,
    sender_name TEXT, -- Cache name to avoid massive joins, or fallback
    sender_avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create 'channel_members' table (for roles and private channels)
CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant', -- 'admin', 'moderator', 'participant', 'viewer'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Channels: Everyone can read public channels
CREATE POLICY "Public channels are viewable by everyone" 
ON public.channels FOR SELECT 
USING (type = 'public' OR auth.uid() IN (SELECT user_id FROM public.channel_members WHERE channel_id = id));

-- Channels: Authenticated users can create channels (or restrict to admins)
CREATE POLICY "Authenticated users can create channels" 
ON public.channels FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Messages: Everyone with access to channel can read messages
CREATE POLICY "Channel members can view messages" 
ON public.messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.channels 
        WHERE id = messages.channel_id AND (type = 'public' OR auth.uid() IN (SELECT user_id FROM public.channel_members WHERE channel_id = id))
    )
);

-- Messages: Authenticated users can insert messages into channels they perform in
CREATE POLICY "Authenticated users can insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Members: Users can view members of channels they can see
CREATE POLICY "View channel members" 
ON public.channel_members FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.channels 
        WHERE id = channel_members.channel_id AND (type = 'public' OR auth.uid() IN (SELECT user_id FROM public.channel_members WHERE channel_id = id))
    )
);

-- Members: Users can join public channels
CREATE POLICY "Join public channels" 
ON public.channel_members FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);
