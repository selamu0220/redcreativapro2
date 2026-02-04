-- SCRIPT DE REPARACIÓN DE COMUNIDAD (V2)
-- Ejecuta esto en el Editor SQL de Supabase para reiniciar permisos y tablas

-- 1. Limpiar políticas antiguas (para evitar errores de "policy already exists")
ERROR_ON_FAIL: FALSE; -- Ignorar errores si no existen las tablas
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON public.channels;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Members are viewable" ON public.channel_members;

-- 2. Asegurar que las tablas existen (Idempotente)
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'public',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL, -- Kinde ID (Texto string)
    content TEXT NOT NULL,
    sender_name TEXT,
    sender_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'participant', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(channel_id, user_id)
);

-- 3. Habilitar RLS (Seguridad a nivel de fila)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- 4. Crear Políticas "Permisivas" (Para Kinde + Supabase)
-- NOTA: Usamos 'TO public' para asegurar que funcione incluso si el rol de autenticación varía

-- CHANNELS
CREATE POLICY "Enable read access for all users" ON public.channels
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON public.channels
    FOR INSERT TO public WITH CHECK (true);

-- MESSAGES
CREATE POLICY "Enable read access for all users" ON public.messages
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON public.messages
    FOR INSERT TO public WITH CHECK (true);

-- MEMBERS
CREATE POLICY "Enable read access for all users" ON public.channel_members
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON public.channel_members
    FOR INSERT TO public WITH CHECK (true);

-- 5. Otorgar permisos explícitos a los roles de Supabase (Solución "Martillo")
GRANT ALL ON public.channels TO anon, authenticated, service_role;
GRANT ALL ON public.messages TO anon, authenticated, service_role;
GRANT ALL ON public.channel_members TO anon, authenticated, service_role;

-- Confirmación
SELECT 'Reparación completada. Tablas y permisos listos.' as status;
