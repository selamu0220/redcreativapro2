-- Create user_page_settings table
CREATE TABLE IF NOT EXISTS public.user_page_settings (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    title VARCHAR(255) DEFAULT 'Suscríbete a nuestro newsletter',
    description TEXT DEFAULT 'Recibe las últimas actualizaciones y contenido exclusivo.',
    button_text VARCHAR(100) DEFAULT 'Suscribirse',
    success_message VARCHAR(255) DEFAULT '¡Gracias por suscribirte!',
    error_message VARCHAR(255) DEFAULT 'Error al procesar la suscripción. Inténtalo de nuevo.',
    background_color VARCHAR(7) DEFAULT '#ffffff',
    text_color VARCHAR(7) DEFAULT '#000000',
    button_color VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_page_settings_email ON public.user_page_settings(user_email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_page_settings ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.user_page_settings TO anon;
GRANT ALL PRIVILEGES ON public.user_page_settings TO authenticated;

-- Create RLS policies
CREATE POLICY "Users can view their own page settings" ON public.user_page_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own page settings" ON public.user_page_settings
    FOR ALL USING (true);

-- Insert default settings for the test user
INSERT INTO public.user_page_settings (user_email, is_active, title, description)
VALUES ('selamu.garcia@gmail.com', true, 'Suscríbete a nuestro newsletter', 'Recibe las últimas actualizaciones y contenido exclusivo.')
ON CONFLICT (user_email) DO NOTHING;