# 🚨 INSTRUCCIONES URGENTES: Página en Blanco

## ⚡ SOLUCIÓN RÁPIDA (5 minutos)

### 1. Verifica las Variables de Entorno en Vercel

**AHORA MISMO:**

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **redcreativapro**
3. Haz clic en **Settings** (arriba)
4. Haz clic en **Environment Variables** (menú izquierdo)

### 2. Busca estas 3 variables y verifica que NO digan "localhost":

```
KINDE_SITE_URL
KINDE_POST_LOGIN_REDIRECT_URL  
KINDE_POST_LOGOUT_REDIRECT_URL
```

### 3. Si alguna dice "localhost", cámbiala:

**❌ INCORRECTO:**
```
KINDE_SITE_URL=http://localhost:3000
```

**✅ CORRECTO:**
```
KINDE_SITE_URL=https://redcreativa.pro
```

### 4. Haz lo mismo con estas dos:

```
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
```

### 5. Redeploy

1. Ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Haz clic en **Redeploy**
4. Espera 2-3 minutos

### 6. Prueba

1. Abre https://redcreativa.pro en **modo incógnito** (Ctrl+Shift+N)
2. ¿Funciona? ✅ **¡Listo!**
3. ¿Sigue en blanco? ❌ **Continúa abajo**

---

## 🔍 SI SIGUE EN BLANCO

### Paso A: Ver errores en el navegador

1. Abre https://redcreativa.pro
2. Presiona **F12**
3. Ve a la pestaña **Console**
4. ¿Ves errores en rojo?
   - **SÍ**: Copia el error y búscalo en Google
   - **NO**: Continúa al Paso B

### Paso B: Ver logs en Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en el último deployment
3. Haz clic en **Runtime Logs**
4. ¿Ves errores?
   - **SÍ**: Copia el error
   - **NO**: Continúa al Paso C

### Paso C: Actualizar Kinde

1. Ve a: https://selamu.kinde.com
2. Ve a **Settings** > **Applications**
3. Selecciona tu aplicación
4. En **Allowed callback URLs**, asegúrate de tener:
   ```
   https://redcreativa.pro/api/auth/kinde_callback
   ```
5. En **Allowed logout redirect URLs**:
   ```
   https://redcreativa.pro
   ```
6. Guarda y vuelve a hacer **Redeploy** en Vercel

---

## 📞 NECESITAS AYUDA URGENTE

### Opción 1: Rollback (volver atrás)

Si tenías un deployment que funcionaba:

1. Ve a **Deployments** en Vercel
2. Encuentra el deployment que funcionaba
3. Haz clic en los **3 puntos**
4. Haz clic en **Promote to Production**

### Opción 2: Modo de emergencia

Ejecuta este comando en tu terminal:

```bash
# Windows
fix-production-blank-page.bat

# O ejecuta el diagnóstico
node diagnose-blank-page.js
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Variables de entorno sin "localhost" en Vercel
- [ ] Redeploy completado
- [ ] Página probada en modo incógnito
- [ ] No hay errores en la consola (F12)
- [ ] Kinde tiene las URLs correctas

---

## 🎯 RESUMEN DE 30 SEGUNDOS

1. **Problema**: Variables de entorno con localhost
2. **Solución**: Cambiar a https://redcreativa.pro en Vercel
3. **Acción**: Settings > Environment Variables > Cambiar > Redeploy
4. **Tiempo**: 5 minutos

---

## 📚 MÁS INFORMACIÓN

- Guía completa: `FIX_PAGINA_BLANCO_PRODUCCION.md`
- Diagnóstico: `node diagnose-blank-page.js`
- Script de ayuda: `fix-production-blank-page.bat`
