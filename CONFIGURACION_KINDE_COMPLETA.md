# 🔐 Configuración Completa de Kinde - Desde Cero

## 📋 Información de tu Aplicación

```
Client ID: 5065812b70004d75809f8d535cb0daa6
Client Secret: KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
Issuer URL: https://selamu.kinde.com
Dominio de Producción: https://redcreativa.pro
```

---

## 🎯 Paso 1: Configurar URLs en Kinde Dashboard

### Ve a: https://app.kinde.com/

1. Inicia sesión
2. Ve a **Applications** (menú lateral)
3. Selecciona **"Red Creativa Pro"**
4. Ve a la pestaña **"Details"**

### Configura estos campos:

#### **Application homepage URI:**
```
https://redcreativa.pro
```

#### **Application login URI:**
```
https://redcreativa.pro/api/auth/login
```

#### **Allowed callback URLs** (una por línea):
```
https://redcreativa.pro/api/auth/kinde_callback
http://localhost:3000/api/auth/kinde_callback
```

#### **Allowed logout redirect URLs** (una por línea):
```
https://redcreativa.pro
http://localhost:3000
```

### Haz clic en **"Save"** (botón arriba a la derecha)

---

## 🎯 Paso 2: Configurar Variables en Vercel

### Ve a: https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables

Agrega o verifica estas variables (para Production, Preview, y Development):

```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

**IMPORTANTE:** Todas las URLs de producción deben usar `https://`

### Después de agregar las variables:

1. Ve a la pestaña **"Deployments"**
2. Haz clic en los 3 puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 1-2 minutos

---

## 🎯 Paso 3: Verificar Archivo Local (.env.local)

Tu archivo `.env.local` debe tener:

```bash
# Kinde Authentication
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

---

## ✅ Verificación

### Probar en Producción:

1. Ve a: https://redcreativa.pro
2. Haz clic en **"Iniciar Sesión"**
3. Deberías ver la página de login de Kinde
4. Después de iniciar sesión → deberías ir al dashboard

### Probar en Local:

1. Ejecuta: `npm run dev`
2. Ve a: http://localhost:3000
3. Haz clic en **"Iniciar Sesión"**
4. Deberías ver la página de login de Kinde
5. Después de iniciar sesión → deberías ir al dashboard

---

## 🔍 Troubleshooting

### Error: "Invalid callback URL"
- ✓ Verifica que agregaste las URLs en Kinde
- ✓ Verifica que hiciste clic en "Save"
- ✓ Espera 10-15 segundos y vuelve a intentar

### Error: "Redirect URI mismatch"
- ✓ Verifica que las URLs en Vercel usen `https://`
- ✓ Verifica que hiciste redeploy después de cambiar variables
- ✓ Limpia la caché del navegador (Ctrl+Shift+Delete)

### La página se queda en blanco:
- ✓ Abre DevTools (F12) → Console
- ✓ Busca errores en rojo
- ✓ Verifica que el sitio cargó correctamente

---

## 📊 Resumen de URLs

| Tipo | URL |
|------|-----|
| Homepage | `https://redcreativa.pro` |
| Login | `https://redcreativa.pro/api/auth/login` |
| Callback (Prod) | `https://redcreativa.pro/api/auth/kinde_callback` |
| Callback (Local) | `http://localhost:3000/api/auth/kinde_callback` |
| Logout (Prod) | `https://redcreativa.pro` |
| Logout (Local) | `http://localhost:3000` |
| Dashboard | `https://redcreativa.pro/dashboard` |

---

## ⏱️ Tiempo Total: 5 minutos

1. Configurar Kinde Dashboard: 2 min
2. Configurar Vercel: 2 min
3. Redeploy: 1 min
4. Probar: 30 seg

---

## ✅ Después de Configurar

Tu sistema de autenticación estará 100% funcional:
- ✓ Login/Registro
- ✓ Sesiones de usuario
- ✓ Protección de rutas
- ✓ Dashboard personalizado
- ✓ Logout
- ✓ Funciona en local y producción

---

**¡Listo! Con esta configuración todo debería funcionar perfectamente. 🚀**
