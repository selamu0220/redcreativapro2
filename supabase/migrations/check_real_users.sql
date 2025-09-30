-- Consultar usuarios reales y su configuración de email
-- Excluir usuarios de prueba

-- Ver todos los usuarios reales (no de prueba)
SELECT 
    email,
    email_provider,
    CASE 
        WHEN email_provider_config IS NOT NULL THEN 'Tiene config JSON'
        WHEN gmail_user IS NOT NULL THEN 'Tiene config legacy'
        ELSE 'Sin configuración'
    END as config_status,
    gmail_user,
    CASE 
        WHEN gmail_password IS NOT NULL THEN 'Contraseña configurada'
        ELSE 'Sin contraseña'
    END as password_status,
    created_at,
    updated_at
FROM users 
WHERE email NOT LIKE '%test%' 
  AND email NOT LIKE '%example%'
  AND email NOT LIKE '%@gmail.com' OR email IS NULL
ORDER BY updated_at DESC;

-- Contar usuarios por estado de configuración (excluyendo pruebas)
SELECT 
    CASE 
        WHEN email_provider_config IS NOT NULL THEN 'Con configuración JSON'
        WHEN gmail_user IS NOT NULL THEN 'Con configuración legacy'
        ELSE 'Sin configuración'
    END as config_type,
    COUNT(*) as cantidad
FROM users 
WHERE email NOT LIKE '%test%' 
  AND email NOT LIKE '%example%'
GROUP BY 
    CASE 
        WHEN email_provider_config IS NOT NULL THEN 'Con configuración JSON'
        WHEN gmail_user IS NOT NULL THEN 'Con configuración legacy'
        ELSE 'Sin configuración'
    END;

-- Ver específicamente usuarios con algún tipo de configuración de email
SELECT 
    email,
    email_provider,
    email_provider_config,
    gmail_user,
    LENGTH(gmail_password) as password_length,
    updated_at
FROM users 
WHERE (email_provider IS NOT NULL 
   OR email_provider_config IS NOT NULL 
   OR gmail_user IS NOT NULL)
  AND email NOT LIKE '%test%' 
  AND email NOT LIKE '%example%'
ORDER BY updated_at DESC;