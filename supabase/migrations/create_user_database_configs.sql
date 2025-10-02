-- Crear tabla para almacenar configuraciones de base de datos por usuario
CREATE TABLE IF NOT EXISTS user_database_configs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  connection_string TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_database_configs ENABLE ROW LEVEL SECURITY;

-- Crear política para que solo usuarios autenticados puedan acceder a sus propias configuraciones
CREATE POLICY "Users can only access their own database configs" ON user_database_configs
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- Otorgar permisos a los roles anon y authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON user_database_configs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_database_configs_id_seq TO authenticated;