# Solución Error 500 en Login de Kinde (Producción)

## Problema Identificado

El error 500 al iniciar sesión en producción ocurre porque las variables de entorno de Kinde están configuradas con URLs de `localhost` en lugar de las URLs de producción.

## Variables que Necesitan Actualización en Vercel

Ve a tu panel de Vercel → Settings → Environment Variables y actualiza estas variables:

### 1. KINDE_SITE_URL
```
Valor actual (incorrecto): http://localhost:3000
Valor correcto: https://redcreativa.pro
```

### 2. KINDE_POST_LOGOUT_REDIRECT_URL
```
Valor actual (incorrecto): http://localhost:3000
Valor correcto: https://redcreativa.pro
```

### 3. KINDE_POST_LOGIN_REDIRECT_URL
```
Valor actual (incorrecto): http://localhost:3000/dashboard
Valor correcto: https://redcreativa.pro/dashboard
```

## Configuración en Kinde Dashboard

También necesitas actualizar las URLs permitidas en tu panel de Kinde:

1. Ve a https://selamu.kinde.com
2. Settings → Applications → Tu aplicación
3. Actualiza:
   - **Allowed callback URLs**: `https://redcreativa.pro/api/auth/kinde_callback`
   - **Allowed logout redirect URLs**: `https://redcreativa.pro`
   - **Allowed origins**: `https://redcreativa.pro`

## Pasos para Aplicar la Solución

1. **En Vercel Dashboard:**
   - Ve a tu proyecto → Settings → Environment Variables
   - Actualiza las 3 variables mencionadas arriba
   - Asegúrate de seleccionar "Production" environment

2. **En Kinde Dashboard:**
   - Actualiza las URLs permitidas como se indica arriba
   - Guarda los cambios

3. **Redeploy:**
   - Vuelve a desplegar tu aplicación en Vercel
   - O espera a que se redeploy automáticamente

## Verificación

Después de aplicar los cambios:
1. Visita https://redcreativa.pro
2. Haz clic en "Iniciar sesión"
3. Deberías ser redirigido a Kinde correctamente
4. Después del login, deberías volver a /dashboard

## Variables de Entorno Completas para Producción

```env
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

## Nota Importante

- El archivo `.env.local` es solo para desarrollo local
- Vercel NO lee el archivo `.env.local` en producción
- Debes configurar las variables directamente en el dashboard de Vercel
