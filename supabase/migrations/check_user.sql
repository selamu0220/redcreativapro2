-- Consultar si el usuario selamu.garcia@gmail.com existe
SELECT 
  id,
  email,
  subscription_status,
  email_provider,
  email_provider_config,
  created_at,
  last_active_at
FROM users 
WHERE email = 'selamu.garcia@gmail.com';

-- Si no existe, crear el usuario
INSERT INTO users (email, subscription_status, email_provider)
SELECT 'selamu.garcia@gmail.com', 'free', 'gmail'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'selamu.garcia@gmail.com'
);

-- Verificar que el usuario fue creado
SELECT 
  id,
  email,
  subscription_status,
  email_provider,
  email_provider_config,
  created_at
FROM users 
WHERE email = 'selamu.garcia@gmail.com';