# Configuración de Variables de Entorno en Vercel

Para que la aplicación funcione correctamente en producción, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

## Variables Requeridas

### 1. Configuración de Gemini AI
```
GEMINI_API_KEY=tu_api_key_real_de_gemini
```

### 2. Configuración de Gmail (para envío de correos)
```
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicacion_gmail
```

### 3. Configuración de Firebase (si usas Firebase)
```
FIREBASE_API_KEY=tu_firebase_api_key
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id
```

### 4. Configuración de Next.js
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://redcreativa.pro
```

## Pasos para Configurar en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings > Environment Variables
4. Agrega cada variable una por una
5. Asegúrate de seleccionar "Production" como entorno
6. Guarda los cambios
7. Redespliega la aplicación

## Comandos para Redespliegue

```bash
# Opción 1: Desde el dashboard de Vercel
# Ve a Deployments > Redeploy

# Opción 2: Desde la línea de comandos
npx vercel --prod
```

## Verificación

Después del redespliegue, verifica que:
- La aplicación carga sin errores en https://redcreativa.pro
- Las funciones de IA funcionan correctamente
- El envío de correos funciona (si está configurado)
- No hay errores en los logs de Vercel