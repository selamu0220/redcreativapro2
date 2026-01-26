# 🚀 Configurar Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: También necesitas configurar Vercel

Además de configurar Kinde, necesitas asegurarte de que Vercel tenga las variables de entorno correctas con HTTPS.

## 📋 Pasos:

### 1. Ve a tu proyecto en Vercel:
- Abre: https://vercel.com/selamu0220s-projects/redcreativapro2
- O ve a https://vercel.com y selecciona tu proyecto

### 2. Ve a Settings → Environment Variables:
- En el menú superior, haz clic en **"Settings"**
- En el menú lateral, haz clic en **"Environment Variables"**

### 3. Verifica/Actualiza estas variables:

Busca estas variables y asegúrate de que tengan los valores correctos:

```bash
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

**IMPORTANTE:** Deben usar `https://` (no `http://`)

### 4. Si no existen, agrégalas:

Para cada variable:
1. Haz clic en **"Add New"**
2. Escribe el nombre (ejemplo: `KINDE_SITE_URL`)
3. Escribe el valor (ejemplo: `https://redcreativa.pro`)
4. Selecciona los ambientes: **Production**, **Preview**, **Development**
5. Haz clic en **"Save"**

### 5. Redeploy:

Después de guardar las variables:
1. Ve a la pestaña **"Deployments"**
2. Encuentra el último deployment
3. Haz clic en los 3 puntos (⋯)
4. Selecciona **"Redeploy"**
5. Confirma

---

## ✅ Variables completas que debes tener en Vercel:

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

## 🔍 Cómo verificar:

Después del redeploy:
1. Ve a https://redcreativa.pro
2. Haz clic en "Iniciar Sesión"
3. Deberías ver la página de Kinde
4. Después de login, deberías regresar al dashboard

---

## 📝 Resumen de pasos completos:

1. ✅ Configurar URLs en Kinde Dashboard (ver `CONFIGURACION_KINDE_FINAL.md`)
2. ✅ Configurar variables en Vercel (este archivo)
3. ✅ Redeploy en Vercel
4. ✅ Probar el login

---

## ⏱️ Tiempo total: 5 minutos
