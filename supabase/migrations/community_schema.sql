-- Create Channels Table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'public',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sender_name TEXT,
    sender_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Channel Members Table
CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'participant', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(channel_id, user_id)
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Create Policies (Simplified for now, assuming server-side admin client mostly, but good practice)
-- Allow public read for public channels
CREATE POLICY "Public channels are viewable by everyone" ON public.channels
    FOR SELECT USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Users can insert messages" ON public.messages
    FOR INSERT WITH CHECK (true);

-- Allow users to view messages in channels
CREATE POLICY "Messages are viewable by everyone" ON public.messages
    FOR SELECT USING (true);

-- Allow users to join channels
CREATE POLICY "Users can join channels" ON public.channel_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Members are viewable" ON public.channel_members
    FOR SELECT USING (true);
