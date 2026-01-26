# ✅ Checklist: Configurar Kinde en Producción

Usa este checklist para asegurarte de que todo está configurado correctamente.

## 📋 Antes de Empezar

- [ ] Tienes acceso al dashboard de Vercel
- [ ] Tienes acceso al dashboard de Kinde (selamu.kinde.com)
- [ ] Conoces tu Client ID y Client Secret de Kinde

## 🔧 Configuración en Vercel

Ve a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

- [ ] `KINDE_CLIENT_ID` = `5065812b70004d75809f8d535cb0daa6`
- [ ] `KINDE_CLIENT_SECRET` = `KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42`
- [ ] `KINDE_ISSUER_URL` = `https://selamu.kinde.com`
- [ ] `KINDE_SITE_URL` = `https://redcreativa.pro` ⚠️ SIN www
- [ ] `KINDE_POST_LOGOUT_REDIRECT_URL` = `https://redcreativa.pro`
- [ ] `KINDE_POST_LOGIN_REDIRECT_URL` = `https://redcreativa.pro/dashboard`
- [ ] Todas las variables están configuradas para el entorno **Production**

## 🔐 Configuración en Kinde Dashboard

Ve a: **https://selamu.kinde.com → Settings → Applications → Red Creativa Pro**

### Allowed callback URLs
- [ ] `https://redcreativa.pro/api/auth/kinde_callback`
- [ ] `http://localhost:3000/api/auth/kinde_callback` (para desarrollo)

### Allowed logout redirect URLs
- [ ] `https://redcreativa.pro`
- [ ] `http://localhost:3000` (para desarrollo)

### Opcional pero recomendado
- [ ] Application homepage URI: `https://redcreativa.pro`
- [ ] Application login URI: `https://redcreativa.pro/api/auth/login`

## 💻 Código del Proyecto

### Archivos Críticos
- [ ] `app/api/auth/[kindeAuth]/route.ts` existe y usa `handleAuth()`
- [ ] `app/components/Providers.tsx` incluye `<KindeProvider>`
- [ ] `middleware.ts` usa `withAuth` de Kinde
- [ ] `app/layout.tsx` envuelve la app con `<Providers>`

### Componentes de Navegación
- [ ] Usas `<LoginLink>` en lugar de links manuales
- [ ] Usas `<LogoutLink>` para cerrar sesión
- [ ] Usas `<RegisterLink>` para registro

## 🚀 Despliegue

- [ ] Commit y push de cambios (si los hay)
- [ ] Redeploy en Vercel después de actualizar variables
- [ ] Espera a que el deployment termine (2-3 minutos)

## ✅ Verificación

### Health Check
- [ ] Visita `https://redcreativa.pro/api/auth/health`
- [ ] Verifica que `clientSecret` diga "Set correctly"
- [ ] Verifica que todas las URLs sean de producción (no localhost)

### Prueba de Login
- [ ] Ve a `https://redcreativa.pro`
- [ ] Click en "Iniciar sesión"
- [ ] Eres redirigido a Kinde (selamu.kinde.com)
- [ ] Después del login, vuelves a `/dashboard`
- [ ] No hay errores 500
- [ ] No hay "State not found"

### Prueba de Logout
- [ ] Click en "Cerrar sesión"
- [ ] Eres redirigido a la home
- [ ] Ya no tienes acceso a rutas protegidas

## 🐛 Si Algo Falla

### Error 500 al hacer login
1. [ ] Verifica variables en Vercel
2. [ ] Verifica callback URLs en Kinde
3. [ ] Revisa logs en Vercel: Deployments → Function Logs
4. [ ] Redeploy

### "State not found"
1. [ ] Verifica que KINDE_SITE_URL sea exactamente `https://redcreativa.pro`
2. [ ] Verifica que no haya mezcla de localhost y producción
3. [ ] Limpia cookies del navegador
4. [ ] Intenta en modo incógnito

### Redirect loop
1. [ ] Verifica que `/api/auth/*` NO esté protegido en middleware
2. [ ] Verifica que las rutas públicas estén en `publicPaths`

## 📚 Recursos

- [ ] He leído `KINDE_SETUP_COMPLETO.md`
- [ ] Tengo `KINDE_QUICK_REFERENCE.md` a mano
- [ ] Sé dónde encontrar los logs de Vercel
- [ ] Sé cómo acceder al dashboard de Kinde

## ✨ Todo Listo

Si todos los checkboxes están marcados, tu configuración de Kinde debería estar funcionando perfectamente en producción.

**Última actualización:** Enero 2025
