-- Verificar permisos de la tabla users
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- También verificar las políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users';