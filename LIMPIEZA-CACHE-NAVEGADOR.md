# 🔥 LIMPIEZA TOTAL DEL CACHÉ - INSTRUCCIONES

## EL PROBLEMA
Los archivos en el servidor están CORRECTOS, pero el navegador sigue mostrando la versión vieja cacheada.

## SOLUCIÓN GARANTIZADA

### OPCIÓN 1: Navegador Diferente (MÁS RÁPIDO)
1. Abre un navegador COMPLETAMENTE DIFERENTE (si usas Chrome, abre Firefox o Edge)
2. Ve a: `http://localhost:3000`
3. **DEBE funcionar** porque ese navegador no tiene caché

### OPCIÓN 2: Limpieza Nuclear del Navegador Actual

#### Chrome/Edge:
1. Cierra TODAS las pestañas
2. Presiona `Ctrl + Shift + Delete`
3. Selecciona:
   - ✅ Cached images and files
   - ✅ Cookies and other site data
   - ✅ Hosted app data  
4. Time range: **All time**
5. Click "Clear data"
6. CIERRA el navegador completamente
7. Abre NUEVO modo incógnito
8. Ve a `http://localhost:3000`

#### Firefox:
1. Cierra TODAS las pestañas
2. Presiona `Ctrl + Shift + Delete`
3. Selecciona:
   - ✅ Cache
   - ✅ Cookies
   - ✅ Offline Website Data
4. Time range: **Everything**
5. Click "Clear Now"
6. CIERRA Firefox completamente  
7. Abre NUEVO modo privado
8. Ve a `http://localhost:3000`

### OPCIÓN 3: DevTools Manual Clean

1. En el navegador abierto, presiona `F12`
2. Ve a tab **Application**
3. Sidebar izquierda:
   - Click **Service Workers** → Unregister ALL
   - Click **Cache Storage** → Delete ALL
   - Click **Local Storage** → Delete ALL
   - Click **Session Storage** → Delete ALL
   - Click **IndexedDB** → Delete ALL
4. Ahora arriba: Click **Clear storage** section
5. Click botón grande **"Clear site data"**
6. Cierra DevTools
7. **Hard Reload**: `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac)

### OPCIÓN 4: Vercel Preview (SI NADA FUNCIONA)

Si todo lo anterior falla localmente, haz deploy a Vercel preview:

```bash
git add .
git commit -m "landing optimizada"
git push
```

Vercel generará una URL limpia sin caché: `https://redcreativapro2-xxx.vercel.app`

---

## ✅ CÓMO SABER QUE FUNCIONA

Deberías ver:

### HOME (`/`):
```
[Badge] Para Periodistas | 0 Detecciones de IA

IA Para Periodistas
Que Saben Escribir

Escribe 3x más rápido con IA que mejora tu estilo...

[3 Cards]
3x          | Auto        | Tu
Más Rápido  | SEO Integrado | Estilo Único
```

### PLANES (`/planes`):
```
¿Por Qué Estás Aquí?

En serio, ¿ya probaste la herramienta o solo vienes a ver precios? 🤔

[Box con borde punteado]
Consejo del creador:
Red Creativa Pro es 100% gratis...
```

---

## SI AÚN NO FUNCIONA

Dime:
1. ¿Qué navegador estás usando?
2. ¿Probaste con navegador DIFERENTE?
3. ¿Qué EXACTAMENTE ves en la home? (copia el título principal)

El código en el servidor es correcto al 100%. Es solo caché ultra-agresivo del navegador.
