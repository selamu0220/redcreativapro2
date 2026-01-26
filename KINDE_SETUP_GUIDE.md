# Guía de Configuración de Kinde Auth

## 1. Crear Cuenta en Kinde

1. Ve a [https://kinde.com](https://kinde.com)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación

## 2. Configurar Variables de Entorno

Añade estas variables a tu archivo `.env.local`:

```bash
# Kinde Authentication
KINDE_CLIENT_ID=tu_client_id_aqui
KINDE_CLIENT_SECRET=tu_client_secret_aqui
KINDE_ISSUER_URL=https://tu_subdomain.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

## 3. Configurar en Kinde Dashboard

1. Ve a tu aplicación en Kinde Dashboard
2. En **Settings** → **Applications** → Tu aplicación
3. Configura las siguientes URLs:

### Allowed callback URLs:
```
http://localhost:3000/api/auth/kinde_callback
https://www.redcreativa.pro/api/auth/kinde_callback
```

### Allowed logout redirect URLs:
```
http://localhost:3000
https://www.redcreativa.pro
```

## 4. Configuración de Producción (Vercel)

En tu proyecto de Vercel, añade las siguientes variables de entorno:

```bash
KINDE_CLIENT_ID=tu_client_id_de_produccion
KINDE_CLIENT_SECRET=tu_client_secret_de_produccion
KINDE_ISSUER_URL=https://tu_subdomain.kinde.com
KINDE_SITE_URL=https://www.redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://www.redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://www.redcreativa.pro/dashboard
```

## 5. Rutas de Autenticación

Kinde proporciona automáticamente estas rutas:

- `/api/auth/login` - Iniciar sesión
- `/api/auth/register` - Registrarse
- `/api/auth/logout` - Cerrar sesión
- `/api/auth/kinde_callback` - Callback después de autenticación

## 6. Características de Kinde

- ✅ Autenticación con email/password
- ✅ OAuth (Google, GitHub, etc.)
- ✅ Gestión de usuarios
- ✅ Roles y permisos
- ✅ Multi-tenancy
- ✅ Webhooks
- ✅ API completa

## 7. Migración de Datos de Clerk

Si tienes usuarios existentes en Clerk, puedes:

1. Exportar usuarios desde Clerk Dashboard
2. Importar usuarios a Kinde usando su API
3. Los usuarios deberán restablecer su contraseña en el primer login

## 8. Testing Local

1. Asegúrate de tener las variables de entorno configuradas
2. Ejecuta `npm run dev`
3. Ve a `http://localhost:3000/auth`
4. Prueba el login/registro

## 9. Soporte

- Documentación: [https://kinde.com/docs](https://kinde.com/docs)
- Soporte: [https://kinde.com/support](https://kinde.com/support)
