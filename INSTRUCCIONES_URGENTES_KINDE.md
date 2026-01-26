# 🚨 INSTRUCCIONES URGENTES - Error 500 en Login

## El Problema
Tu aplicación funciona en localhost pero da error 500 al iniciar sesión en producción (redcreativa.pro).

## La Causa
Las variables de entorno de Kinde en Vercel están configuradas con URLs de `localhost` en lugar de las URLs de producción.

## Solución Rápida (5 minutos)

### Paso 1: Actualizar Variables en Vercel

1. Ve a: https://vercel.com/tu-proyecto/settings/environment-variables

2. Busca y actualiza estas 3 variables (selecciona "Production"):

   ```
   KINDE_SITE_URL
   Valor nuevo: https://redcreativa.pro
   ```

   ```
   KINDE_POST_LOGOUT_REDIRECT_URL
   Valor nuevo: https://redcreativa.pro
   ```

   ```
   KINDE_POST_LOGIN_REDIRECT_URL
   Valor nuevo: https://redcreativa.pro/dashboard
   ```

### Paso 2: Actualizar Configuración en Kinde

1. Ve a: https://selamu.kinde.com

2. Settings → Applications → [Tu aplicación]

3. En "Allowed callback URLs", agrega:
   ```
   https://redcreativa.pro/api/auth/kinde_callback
   ```

4. En "Allowed logout redirect URLs", agrega:
   ```
   https://redcreativa.pro
   ```

5. Guarda los cambios

### Paso 3: Redeploy

1. Ve a tu proyecto en Vercel
2. Haz clic en "Deployments"
3. En el último deployment, haz clic en los 3 puntos → "Redeploy"
4. Espera 2-3 minutos

### Paso 4: Probar

1. Ve a https://redcreativa.pro
2. Haz clic en "Iniciar sesión"
3. Deberías poder iniciar sesión correctamente

## ¿Por qué pasó esto?

El archivo `.env.local` que tienes en tu proyecto es solo para desarrollo local. Vercel NO lee ese archivo en producción. Debes configurar las variables directamente en el dashboard de Vercel.

## Verificación

Después de hacer los cambios, ejecuta:
```bash
node verify-kinde-production.js
```

## ¿Necesitas Ayuda?

Si después de seguir estos pasos sigue sin funcionar:

1. Verifica los logs en Vercel Dashboard → Deployments → [último deployment] → Function Logs
2. Busca errores relacionados con "kinde" o "auth"
3. Asegúrate de que las URLs en Kinde Dashboard coincidan exactamente con las de Vercel

## Resumen de URLs Correctas

| Variable | Valor Correcto |
|----------|----------------|
| KINDE_SITE_URL | https://redcreativa.pro |
| KINDE_POST_LOGOUT_REDIRECT_URL | https://redcreativa.pro |
| KINDE_POST_LOGIN_REDIRECT_URL | https://redcreativa.pro/dashboard |
| KINDE_ISSUER_URL | https://selamu.kinde.com |

Las otras variables (CLIENT_ID, CLIENT_SECRET) están correctas y no necesitan cambios.
