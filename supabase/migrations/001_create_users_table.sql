-- Crear tabla users para almacenar datos de usuarios y configuraciones de email provider
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'pro', 'premium')),
  trial_start_date TIMESTAMPTZ,
  
  -- Stripe subscription data
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly', 'lifetime')),
  subscription_active BOOLEAN DEFAULT false,
  subscription_cancel_at_period_end BOOLEAN DEFAULT false,
  subscription_current_period_start TIMESTAMPTZ,
  subscription_current_period_end TIMESTAMPTZ,
  subscription_canceled_at TIMESTAMPTZ,
  subscription_created TIMESTAMPTZ,
  last_payment_status TEXT CHECK (last_payment_status IN ('succeeded', 'failed', 'pending', 'canceled')),
  next_billing_date TIMESTAMPTZ,
  is_premium BOOLEAN DEFAULT false,
  
  -- AI Studio configuration
  ai_studio_api_key TEXT,
  
  -- Old email system configuration removed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
-- Old email provider index removed
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios autenticados accedan a sus propios datos
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.email() = email);

-- Política para permitir acceso anónimo (para la aplicación)
CREATE POLICY "Allow anonymous access" ON users
    FOR ALL USING (true);

-- Otorgar permisos a los roles anon y authenticated
GRANT ALL PRIVILEGES ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla principal de usuarios';
COMMENT ON COLUMN users.subscription_status IS 'Estado de la suscripción: free, trial, pro, premium';