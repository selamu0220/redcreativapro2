-- Voice Guide System Database Schema
-- Created: 2024-12-25
-- Description: Complete database schema for AI Voice Guide system

-- Create tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for tutorials
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_difficulty ON tutorials(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_tutorials_active ON tutorials(is_active);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt')),
    voice_id VARCHAR(100) NOT NULL,
    playback_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (playback_speed >= 0.5 AND playback_speed <= 2.0),
    auto_play BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create tutorial_progress table
CREATE TABLE IF NOT EXISTS tutorial_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    current_position JSONB DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tutorial_id)
);

-- Create indexes for tutorial_progress
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_tutorial_id ON tutorial_progress(tutorial_id);

-- Create hotspots table
CREATE TABLE IF NOT EXISTS hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
    element_selector VARCHAR(500) NOT NULL,
    position_data JSONB NOT NULL,
    trigger_type VARCHAR(50) DEFAULT 'click' CHECK (trigger_type IN ('click', 'hover', 'auto')),
    metadata JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for hotspots
CREATE INDEX IF NOT EXISTS idx_hotspots_tutorial_id ON hotspots(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_sort_order ON hotspots(sort_order);
CREATE INDEX IF NOT EXISTS idx_hotspots_active ON hotspots(is_active);

-- Create voice_scripts table
CREATE TABLE IF NOT EXISTS voice_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
    hotspot_id UUID REFERENCES hotspots(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    script_content TEXT NOT NULL,
    context_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for voice_scripts
CREATE INDEX IF NOT EXISTS idx_voice_scripts_tutorial_id ON voice_scripts(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_voice_scripts_hotspot_id ON voice_scripts(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_voice_scripts_language ON voice_scripts(language);
CREATE INDEX IF NOT EXISTS idx_voice_scripts_context_key ON voice_scripts(context_key);

-- Create audio_cache table
CREATE TABLE IF NOT EXISTS audio_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES voice_scripts(id) ON DELETE CASCADE,
    voice_id VARCHAR(100) NOT NULL,
    audio_url TEXT NOT NULL,
    file_size INTEGER,
    duration_seconds DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    UNIQUE(script_id, voice_id)
);

-- Create indexes for audio_cache
CREATE INDEX IF NOT EXISTS idx_audio_cache_script_id ON audio_cache(script_id);
CREATE INDEX IF NOT EXISTS idx_audio_cache_voice_id ON audio_cache(voice_id);
CREATE INDEX IF NOT EXISTS idx_audio_cache_expires_at ON audio_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tutorial_progress
CREATE POLICY "Users can view own progress" ON tutorial_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON tutorial_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON tutorial_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON tutorial_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for public read access
CREATE POLICY "Public read access for tutorials" ON tutorials
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for hotspots" ON hotspots
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for voice_scripts" ON voice_scripts
    FOR SELECT USING (true);

CREATE POLICY "Public read access for audio_cache" ON audio_cache
    FOR SELECT USING (expires_at > NOW());

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON tutorials TO anon, authenticated;
GRANT SELECT ON hotspots TO anon, authenticated;
GRANT SELECT ON voice_scripts TO anon, authenticated;
GRANT SELECT ON audio_cache TO anon, authenticated;

-- Grant full access to authenticated users for their own data
GRANT ALL PRIVILEGES ON user_preferences TO authenticated;
GRANT ALL PRIVILEGES ON tutorial_progress TO authenticated;

-- Insert initial tutorial data
INSERT INTO tutorials (title, description, category, difficulty_level, metadata) VALUES
('Dashboard Overview', 'Complete guide to understanding your dashboard and its features', 'getting-started', 'beginner', '{"duration_minutes": 5, "steps": 8}'),
('Email AI Features', 'Learn how to use AI-powered email generation and customization', 'ai-tools', 'intermediate', '{"duration_minutes": 8, "steps": 12}'),
('Contact Management', 'Manage your contacts and campaigns effectively', 'contacts', 'beginner', '{"duration_minutes": 6, "steps": 10}'),
('Statistics Dashboard', 'Understanding your analytics and performance metrics', 'analytics', 'intermediate', '{"duration_minutes": 7, "steps": 9}'),
('Subscription Plans', 'Overview of available plans and features', 'billing', 'beginner', '{"duration_minutes": 4, "steps": 6}');

-- Insert hotspots for Dashboard Overview tutorial
INSERT INTO hotspots (tutorial_id, element_selector, position_data, trigger_type, sort_order, metadata)
SELECT 
    t.id,
    '.dashboard-header',
    '{"x": 50, "y": 20, "placement": "bottom"}',
    'click',
    1,
    '{"title": "Dashboard Header", "description": "Main navigation and user info"}'
FROM tutorials t WHERE t.title = 'Dashboard Overview';

INSERT INTO hotspots (tutorial_id, element_selector, position_data, trigger_type, sort_order, metadata)
SELECT 
    t.id,
    '.ai-tools-grid',
    '{"x": 50, "y": 50, "placement": "top"}',
    'click',
    2,
    '{"title": "AI Tools Grid", "description": "Available AI-powered tools"}'
FROM tutorials t WHERE t.title = 'Dashboard Overview';

INSERT INTO hotspots (tutorial_id, element_selector, position_data, trigger_type, sort_order, metadata)
SELECT 
    t.id,
    '.user-stats',
    '{"x": 80, "y": 30, "placement": "left"}',
    'click',
    3,
    '{"title": "User Statistics", "description": "Your usage and performance metrics"}'
FROM tutorials t WHERE t.title = 'Dashboard Overview';

-- Insert voice scripts for English
INSERT INTO voice_scripts (tutorial_id, hotspot_id, language, script_content, context_key)
SELECT 
    t.id,
    h.id,
    'en',
    'Welcome to your dashboard! This is your central hub where you can access all the AI-powered tools for creative professionals. The header contains your user information and main navigation options.',
    'dashboard-header-intro'
FROM tutorials t
JOIN hotspots h ON h.tutorial_id = t.id
WHERE t.title = 'Dashboard Overview' AND h.element_selector = '.dashboard-header';

INSERT INTO voice_scripts (tutorial_id, hotspot_id, language, script_content, context_key)
SELECT 
    t.id,
    h.id,
    'en',
    'This grid shows all the AI tools available to you. Each tool is designed to help creative professionals with specific tasks like email generation, content creation, and contact management. Click on any tool to get started.',
    'ai-tools-grid-intro'
FROM tutorials t
JOIN hotspots h ON h.tutorial_id = t.id
WHERE t.title = 'Dashboard Overview' AND h.element_selector = '.ai-tools-grid';

INSERT INTO voice_scripts (tutorial_id, hotspot_id, language, script_content, context_key)
SELECT 
    t.id,
    h.id,
    'en',
    'Your user statistics show important metrics about your usage, including the number of emails generated, contacts managed, and overall activity. This helps you track your productivity and progress.',
    'user-stats-intro'
FROM tutorials t
JOIN hotspots h ON h.tutorial_id = t.id
WHERE t.title = 'Dashboard Overview' AND h.element_selector = '.user-stats';

-- Insert voice scripts for Spanish
INSERT INTO voice_scripts (tutorial_id, hotspot_id, language, script_content, context_key)
SELECT 
    t.id,
    h.id,
    'es',
    '¡Bienvenido a tu panel de control! Este es tu centro principal donde puedes acceder a todas las herramientas de IA para profesionales creativos. El encabezado contiene tu información de usuario y las opciones de navegación principales.',
    'dashboard-header-intro'
FROM tutorials t
JOIN hotspots h ON h.tutorial_id = t.id
WHERE t.title = 'Dashboard Overview' AND h.element_selector = '.dashboard-header';

INSERT INTO voice_scripts (tutorial_id, hotspot_id, language, script_content, context_key)
SELECT 
    t.id,
    h.id,
    'es',
    'Esta cuadrícula muestra todas las herramientas de IA disponibles para ti. Cada herramienta está diseñada para ayudar a los profesionales creativos con tareas específicas como generación de correos, creación de contenido y gestión de contactos. Haz clic en cualquier herramienta para comenzar.',
    'ai-tools-grid-intro'
FROM tutorials t
JOIN hotspots h ON h.tutorial_id = t.id
WHERE t.title = 'Dashboard Overview' AND h.element_selector = '.ai-tools-grid';

-- Create function to clean expired audio cache
CREATE OR REPLACE FUNCTION clean_expired_audio_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audio_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tutorials_updated_at
    BEFORE UPDATE ON tutorials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_scripts_updated_at
    BEFORE UPDATE ON voice_scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();