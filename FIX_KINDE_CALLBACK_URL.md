# 🔧 Configurar Callback URL en Kinde

## El Problema
Kinde está rechazando el callback porque falta agregar la URL de producción en la configuración.

**URL que necesitas agregar:**
```
https://redcreativa.pro/api/auth/kinde_callback
```

**Client ID:**
```
5065812b70004d75809f8d535cb0daa6
```

## Solución Rápida - Opción 1: Usar el Link Directo

Kinde te mostró un link que dice "Add callback to application now". Haz clic en ese link y te llevará directamente a agregar la URL.

## Solución Manual - Opción 2: Configurar en Kinde Dashboard

### Paso 1: Ir a Kinde Dashboard
1. Ve a: https://app.kinde.com/
2. Inicia sesión con tu cuenta

### Paso 2: Seleccionar tu Aplicación
1. En el menú lateral, ve a **Applications**
2. Busca la aplicación con Client ID: `5065812b70004d75809f8d535cb0daa6`
3. Haz clic en ella

### Paso 3: Agregar Callback URLs
1. Busca la sección **Allowed callback URLs**
2. Agrega estas URLs (una por línea):
   ```
   https://redcreativa.pro/api/auth/kinde_callback
   http://localhost:3000/api/auth/kinde_callback
   ```

### Paso 4: Agregar Logout URLs
1. En la misma página, busca **Allowed logout redirect URLs**
2. Agrega:
   ```
   https://redcreativa.pro
   http://localhost:3000
   ```

### Paso 5: Guardar
1. Haz clic en **Save** o **Update**
2. Espera unos segundos para que se propague

## Verificación

Después de agregar las URLs, prueba:

1. Ve a: https://redcreativa.pro
2. Haz clic en "Iniciar Sesión"
3. Deberías poder iniciar sesión sin errores

## URLs Completas que Debes Agregar

### Allowed Callback URLs:
```
https://redcreativa.pro/api/auth/kinde_callback
http://localhost:3000/api/auth/kinde_callback
```

### Allowed Logout Redirect URLs:
```
https://redcreativa.pro
http://localhost:3000
```

## Si Sigues Teniendo Problemas

Verifica que las variables de entorno en Vercel sean correctas:

```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=[tu-secret]
KINDE_ISSUER_URL=[tu-issuer-url]
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

## Nota Importante

Este error es NORMAL la primera vez que despliegas a producción. Solo necesitas agregar la URL de callback una vez y funcionará para siempre.
