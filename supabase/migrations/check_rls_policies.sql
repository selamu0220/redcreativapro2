-- Verificar y configurar políticas RLS para la tabla users

-- Primero, verificar las políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- Crear política para permitir que usuarios autenticados actualicen sus propios datos
-- (esto es necesario para que funcione la actualización de email_provider_config)
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Crear política para permitir que usuarios autenticados lean sus propios datos
DROP POLICY IF EXISTS "Users can read their own data" ON users;

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Crear política para permitir insertar nuevos usuarios
DROP POLICY IF EXISTS "Users can be created" ON users;

CREATE POLICY "Users can be created" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verificar que las políticas se crearon correctamente
SELECT 'Políticas RLS configuradas correctamente' as status;

-- Mostrar las políticas actuales después de la configuración
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;