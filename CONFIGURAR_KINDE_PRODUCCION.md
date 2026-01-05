# 🚀 Configuración de Kinde para Producción

## Problema Actual
El callback URL no está configurado en Kinde. Necesitas hacer 2 cosas:

## ✅ PASO 1: Agregar Callback URL en Kinde Dashboard

### Opción A: Link Rápido (Recomendado)
El mensaje de error tiene un botón que dice **"Add callback to application now"**. 
Haz clic ahí y te llevará directamente.

### Opción B: Manual
1. Ve a https://app.kinde.com/
2. Ve a **Applications** en el menú lateral
3. Selecciona tu aplicación (Client ID: `5065812b70004d75809f8d535cb0daa6`)
4. En **Allowed callback URLs**, agrega:
   ```
   https://redcreativa.pro/api/auth/kinde_callback
   ```
5. En **Allowed logout redirect URLs**, agrega:
   ```
   https://redcreativa.pro
   ```
6. Haz clic en **Save**

## ✅ PASO 2: Verificar Variables de Entorno en Vercel

Ve a tu dashboard de Vercel y verifica que estas variables estén configuradas:

```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

**IMPORTANTE:** Asegúrate de que todas las URLs usen `https://` (no `http://`)

### Cómo actualizar en Vercel:

1. Ve a https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables
2. Busca cada variable de Kinde
3. Si tiene `http://`, edítala y cámbiala a `https://`
4. Guarda los cambios

## ✅ PASO 3: Redesplegar (si cambiaste variables)

Si modificaste alguna variable de entorno en Vercel:

```bash
vercel --prod
```

O desde el dashboard de Vercel:
1. Ve a **Deployments**
2. Haz clic en los 3 puntos del último deployment
3. Selecciona **Redeploy**

## 🎯 Verificación Final

Después de completar los pasos:

1. Ve a https://redcreativa.pro
2. Haz clic en **Iniciar Sesión**
3. Deberías ver la pantalla de login de Kinde
4. Después de iniciar sesión, deberías regresar a tu dashboard

## 📝 Resumen de URLs Necesarias

### En Kinde Dashboard:
- **Callback URL**: `https://redcreativa.pro/api/auth/kinde_callback`
- **Logout URL**: `https://redcreativa.pro`

### En Vercel Environment Variables:
- **KINDE_SITE_URL**: `https://redcreativa.pro`
- **KINDE_POST_LOGOUT_REDIRECT_URL**: `https://redcreativa.pro`
- **KINDE_POST_LOGIN_REDIRECT_URL**: `https://redcreativa.pro/dashboard`

## ⚠️ Nota Importante

Este es un paso de configuración que solo necesitas hacer UNA VEZ. Una vez configurado, funcionará para siempre.
