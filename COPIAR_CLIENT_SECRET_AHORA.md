# 🔑 COPIAR CLIENT SECRET DE KINDE

## ⚠️ IMPORTANTE

Tu `.env.local` ahora está configurado correctamente para **desarrollo local** (localhost).

Pero necesitas copiar el **Client Secret** real de Kinde.

---

## 📍 PASO 1: Obtener el Client Secret

1. Ve a: **https://app.kinde.com/**
2. Ve a **Applications** → **Red Creativa Pro**
3. Ve a la pestaña **"Details"**
4. Busca el campo **"Client secret"**
5. Verás: `** Hidden until copied **`
6. **Haz clic** en el campo o en el botón de copiar
7. El secret se copiará a tu portapapeles

---

## 📍 PASO 2: Verificar que es el correcto

El Client Secret que copies debe empezar con:
```
KzUrUzfBKlHWq0n7...
```

Si empieza diferente, estás en la aplicación incorrecta.

---

## 📍 PASO 3: Actualizar .env.local (YA ESTÁ HECHO)

✅ Ya actualicé tu `.env.local` con la configuración correcta para localhost.

**Configuración actual:**
```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

**Nota:** Estas URLs usan `http://localhost:3000` para desarrollo local.

---

## 📍 PASO 4: Configurar Vercel para Producción

Para que funcione en **producción** (https://redcreativa.pro), necesitas configurar Vercel:

1. Ve a: **https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables**

2. Agrega o actualiza estas variables (para **Production**, **Preview**, y **Development**):

```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

**IMPORTANTE:** En Vercel, las URLs deben usar `https://redcreativa.pro` (no localhost).

3. Después de agregar las variables, haz un **Redeploy**:
   - Ve a **Deployments**
   - Haz clic en ⋯ del último deployment
   - Selecciona **"Redeploy"**

---

## 📍 PASO 5: Configurar Callback URLs en Kinde

En el dashboard de Kinde, en la pestaña **"Details"**:

### Allowed callback URLs:
```
https://redcreativa.pro/api/auth/kinde_callback
http://localhost:3000/api/auth/kinde_callback
```

### Allowed logout redirect URLs:
```
https://redcreativa.pro
http://localhost:3000
```

**Haz clic en "Save"** y espera a ver la confirmación.

---

## 🧪 PASO 6: Probar

### Probar en Local:
```bash
npm run dev
```

Luego ve a: http://localhost:3000 y haz clic en "Iniciar Sesión"

### Probar en Producción:

Ve a: https://redcreativa.pro y haz clic en "Iniciar Sesión"

---

## ✅ Resumen

**Para desarrollo local (.env.local):**
- ✅ Ya está configurado con `http://localhost:3000`

**Para producción (Vercel):**
- ⏳ Necesitas agregar las variables con `https://redcreativa.pro`
- ⏳ Necesitas hacer redeploy

**En Kinde Dashboard:**
- ⏳ Necesitas agregar ambas callback URLs (localhost y producción)
- ⏳ Necesitas hacer clic en "Save"

---

## 🚀 Comandos Rápidos

### Abrir Kinde Dashboard:
```bash
start https://app.kinde.com/
```

### Abrir Vercel Dashboard:
```bash
start https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables
```

### Verificar configuración:
```bash
node verificar-kinde-dashboard.js
```

---

## 💡 Diferencia entre Local y Producción

**Local (desarrollo):**
- Usa: `http://localhost:3000`
- Configurado en: `.env.local`
- Para probar en tu computadora

**Producción (live):**
- Usa: `https://redcreativa.pro`
- Configurado en: Vercel
- Para usuarios reales

**Ambas URLs deben estar registradas en Kinde** para que funcionen.

---

**¿Listo?** Sigue los pasos y todo funcionará. 🎯

