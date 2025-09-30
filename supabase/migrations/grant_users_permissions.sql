-- Otorgar permisos a la tabla users para los roles anon y authenticated
-- Esto es necesario para que las operaciones de lectura y escritura funcionen correctamente

-- Otorgar permisos SELECT a anon (para operaciones de lectura básicas)
GRANT SELECT ON users TO anon;

-- Otorgar todos los privilegios a authenticated (para usuarios autenticados)
GRANT ALL PRIVILEGES ON users TO authenticated;

-- Verificar que los permisos se otorgaron correctamente
SELECT 'Permisos otorgados correctamente' as status;

-- Mostrar los permisos actuales
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;