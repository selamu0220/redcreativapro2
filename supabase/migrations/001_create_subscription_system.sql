-- Migración: Sistema de Suscripciones y Control de Acceso
-- Fecha: 2024-01-20
-- Descripción: Crear tablas para gestión de suscripciones, pagos, logs y sugerencias

-- Extender tabla users existente para período de prueba
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Logs de Uso
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    tool_used VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Sugerencias
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de la aplicación
CREATE TABLE IF NOT EXISTS app_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE subscriptions.id = payments.subscription_id 
            AND subscriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own usage logs" ON usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage logs" ON usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions" ON suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own suggestions" ON suggestions
    FOR SELECT USING (auth.uid() = user_id);

-- Permisos para roles
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT SELECT ON payments TO authenticated;
GRANT SELECT, INSERT ON usage_logs TO authenticated;
GRANT SELECT, INSERT ON suggestions TO authenticated;
GRANT SELECT ON app_config TO anon, authenticated;

-- Función para calcular días restantes (CAMBIO CRÍTICO: 3 días en lugar de 7)
CREATE OR REPLACE FUNCTION calculate_days_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    subscription_end TIMESTAMP WITH TIME ZONE;
    trial_start TIMESTAMP WITH TIME ZONE;
    days_remaining INTEGER;
BEGIN
    -- Verificar suscripción activa
    SELECT current_period_end INTO subscription_end
    FROM subscriptions 
    WHERE user_id = user_uuid AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
    
    IF subscription_end IS NOT NULL THEN
        -- Usuario con suscripción activa
        days_remaining := EXTRACT(DAY FROM (subscription_end - NOW()));
        RETURN GREATEST(days_remaining, 0);
    END IF;
    
    -- Verificar período de prueba (3 DÍAS)
    SELECT trial_started_at INTO trial_start
    FROM users WHERE id = user_uuid;
    
    IF trial_start IS NOT NULL THEN
        days_remaining := 3 - EXTRACT(DAY FROM (NOW() - trial_start));
        RETURN GREATEST(days_remaining, 0);
    END IF;
    
    -- Usuario nuevo, iniciar prueba de 3 días
    UPDATE users SET trial_started_at = NOW() WHERE id = user_uuid;
    RETURN 3;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at
    BEFORE UPDATE ON app_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos iniciales de configuración
INSERT INTO app_config (key, value, description) VALUES
('free_trial_days', '3', 'Días de prueba gratuita'),
('creator_phone', '+34 686887074', 'Teléfono del creador'),
('creator_photo_url', 'https://drive.google.com/file/d/17tDmIvcSeRPIIvsfQ-gzlEo58i9_xQFw/view?usp=sharing', 'URL de la foto del creador'),
('calendly_url', 'https://calendly.com/redcreativa', 'URL para agendar reuniones'),
('creator_name', 'Red Creativa Pro', 'Nombre del creador'),
('creator_title', 'Creador de Red Creativa', 'Título del creador')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;