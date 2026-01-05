# 🎯 Solución Paso a Paso - Error de Callback URL

## ❌ El Error que Recibes

```
Invalid callback URL
Looks like the allowed callback URLs in your Kinde application don't include the one below
You provided: https://redcreativa.pro/api/auth/kinde_callback
Application Client ID: 5065812b70004d75809f8d535cb0daa6
```

---

## ✅ Solución en 5 Pasos (5 minutos)

### 📍 PASO 1: Abrir Kinde Dashboard

1. Abre tu navegador
2. Ve a: **https://app.kinde.com/**
3. Inicia sesión si es necesario

---

### 📍 PASO 2: Ir a tu Aplicación

1. En el menú lateral izquierdo, haz clic en **"Applications"**
2. Busca la aplicación llamada **"Red Creativa Pro"**
3. Haz clic en ella para abrirla
4. Haz clic en la pestaña **"Details"**

**IMPORTANTE:** Verifica que el **Client ID** sea:
```
5065812b70004d75809f8d535cb0daa6
```

Si NO coincide, estás en la aplicación incorrecta. Busca la correcta.

---

### 📍 PASO 3: Configurar Callback URLs

Busca el campo llamado **"Allowed callback URLs"**

#### Opción A: Si el campo está vacío o tiene URLs incorrectas

1. **BORRA** todo lo que esté en el campo
2. **COPIA** estas dos líneas exactamente como están:

```
https://redcreativa.pro/api/auth/kinde_callback
http://localhost:3000/api/auth/kinde_callback
```

3. **PEGA** las dos líneas en el campo
4. Verifica que cada URL esté en una línea separada
5. Verifica que NO haya espacios al final de las URLs

#### Opción B: Si ves el botón "Add callback to application now"

1. Haz clic en el botón **"Add callback to application now"** que aparece en el error
2. Kinde agregará automáticamente: `https://redcreativa.pro/api/auth/kinde_callback`
3. Luego, agrega manualmente la URL de localhost: `http://localhost:3000/api/auth/kinde_callback`

---

### 📍 PASO 4: Configurar Logout URLs

Busca el campo llamado **"Allowed logout redirect URLs"**

1. **BORRA** todo lo que esté en el campo
2. **COPIA** estas dos líneas exactamente como están:

```
https://redcreativa.pro
http://localhost:3000
```

3. **PEGA** las dos líneas en el campo
4. Verifica que cada URL esté en una línea separada

---

### 📍 PASO 5: Guardar y Verificar

1. Haz clic en el botón **"Save"** (arriba a la derecha)
2. **ESPERA** a que aparezca un mensaje de confirmación
   - Puede ser un checkmark verde ✓
   - O un mensaje que diga "Saved" o "Changes saved"
3. **NO CIERRES** la pestaña inmediatamente
4. Espera 5 segundos después de ver la confirmación
5. **REFRESCA** la página (presiona F5 o Ctrl+R)
6. **VERIFICA** que las URLs siguen ahí después de refrescar

**Si las URLs NO están después de refrescar:**
- NO se guardaron correctamente
- Repite los pasos 3, 4 y 5
- Asegúrate de esperar a ver el mensaje de confirmación

**Si las URLs SÍ están después de refrescar:**
- ✅ Se guardaron correctamente
- Continúa al siguiente paso

---

## 🧪 Probar el Login

### Prueba 1: En Modo Incógnito

1. Abre una ventana de incógnito (Ctrl+Shift+N en Chrome)
2. Ve a: **https://redcreativa.pro**
3. Haz clic en **"Iniciar Sesión"**
4. Deberías ver la página de login de Kinde
5. Inicia sesión con tu cuenta
6. Deberías ser redirigido al dashboard

**Si funciona:** ✅ ¡Perfecto! La configuración es correcta.

**Si NO funciona:** Continúa al siguiente paso.

---

### Prueba 2: Verificar Vercel

Es posible que las variables de entorno en Vercel tengan HTTP en lugar de HTTPS.

1. Ve a: **https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables**
2. Busca estas variables:
   - `KINDE_SITE_URL`
   - `KINDE_POST_LOGOUT_REDIRECT_URL`
   - `KINDE_POST_LOGIN_REDIRECT_URL`
3. Verifica que TODAS usen **HTTPS** (no HTTP):
   - `KINDE_SITE_URL` = `https://redcreativa.pro`
   - `KINDE_POST_LOGOUT_REDIRECT_URL` = `https://redcreativa.pro`
   - `KINDE_POST_LOGIN_REDIRECT_URL` = `https://redcreativa.pro/dashboard`
4. Si alguna tiene HTTP, haz clic en los 3 puntos (⋯) y edítala
5. Cambia `http://` por `https://`
6. Guarda los cambios
7. Ve a la pestaña **"Deployments"**
8. Haz clic en los 3 puntos (⋯) del último deployment
9. Selecciona **"Redeploy"**
10. Espera 1-2 minutos a que termine el deploy
11. Prueba el login de nuevo

---

## 🔍 Troubleshooting

### El error persiste después de guardar en Kinde

**Posibles causas:**

1. **Las URLs no se guardaron correctamente**
   - Solución: Refresca la página de Kinde y verifica que las URLs siguen ahí
   - Si no están, repite los pasos 3, 4 y 5

2. **Estás en la aplicación incorrecta**
   - Solución: Verifica que el Client ID sea `5065812b70004d75809f8d535cb0daa6`
   - Si no coincide, busca la aplicación correcta

3. **Hay un espacio o carácter invisible en las URLs**
   - Solución: Borra todo y copia las URLs directamente de este documento

4. **Kinde está cacheando la configuración antigua**
   - Solución: Espera 1-2 minutos y vuelve a intentar
   - Prueba en modo incógnito

5. **Las variables de Vercel tienen HTTP en lugar de HTTPS**
   - Solución: Sigue la "Prueba 2: Verificar Vercel" arriba

---

### Cómo verificar si el problema es de Kinde o de Vercel

**Prueba en local:**

1. Abre una terminal
2. Ejecuta: `npm run dev`
3. Ve a: `http://localhost:3000`
4. Haz clic en "Iniciar Sesión"
5. Intenta iniciar sesión

**Si funciona en local pero NO en producción:**
- El problema es la configuración de producción en Kinde
- Verifica que `https://redcreativa.pro/api/auth/kinde_callback` esté en Kinde
- Verifica que las variables de Vercel usen HTTPS

**Si NO funciona ni en local ni en producción:**
- El problema es la configuración general de Kinde
- Verifica que ambas URLs estén en Kinde
- Verifica el Client ID y Client Secret

---

## 📸 Capturas de Pantalla para Ayuda

Si nada funciona, toma estas capturas de pantalla:

1. **Dashboard de Kinde:**
   - El campo "Allowed callback URLs" con las URLs visibles
   - El Client ID visible en la página

2. **Error completo:**
   - La pantalla completa del error que recibes

3. **DevTools Console:**
   - Abre DevTools (F12)
   - Ve a la pestaña "Console"
   - Captura cualquier error en rojo

Con estas capturas podré ayudarte mejor.

---

## 🚀 Comandos Rápidos

### Verificar configuración local:
```bash
node verificar-kinde-dashboard.js
```

### Verificación completa paso a paso:
```bash
verificar-kinde-completo.bat
```

### Abrir dashboards:
```bash
abrir-dashboards.bat
```

---

## 📚 Documentación Adicional

- **Diagnóstico detallado:** `DIAGNOSTICO_KINDE_CALLBACK.md`
- **Configuración completa:** `CONFIGURACION_KINDE_COMPLETA.md`
- **Checklist:** `CHECKLIST_FINAL_KINDE.md`
- **Resumen final:** `RESUMEN_FINAL_TODO.md`

---

## ✅ Resumen

**Lo que necesitas hacer:**

1. ✓ Ir a Kinde Dashboard
2. ✓ Verificar que estás en la aplicación correcta (Client ID)
3. ✓ Agregar las callback URLs
4. ✓ Agregar las logout URLs
5. ✓ Guardar y verificar que se guardaron
6. ✓ Probar el login en modo incógnito
7. ✓ Si no funciona, verificar Vercel y hacer redeploy

**Tiempo total: 5 minutos**

---

**¿Necesitas más ayuda?**

Ejecuta: `verificar-kinde-completo.bat` para una guía interactiva paso a paso.

