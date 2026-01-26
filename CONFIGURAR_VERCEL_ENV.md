# Configurar Variables de Entorno en Vercel

## 🎯 Objetivo

Configurar `NEXT_PUBLIC_SITE_URL` en Vercel para que el sitemap use el dominio correcto.

## 📋 Pasos

### 1. Accede a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Inicia sesión si es necesario
3. Selecciona tu proyecto: **redcreativapro2** (o el nombre de tu proyecto)

### 2. Ve a Settings → Environment Variables

1. En el menú lateral, haz clic en **Settings**
2. En el submenú, haz clic en **Environment Variables**

### 3. Agrega la Variable

1. Haz clic en el botón **Add New**
2. Completa los campos:

   **Name (Nombre):**
   ```
   NEXT_PUBLIC_SITE_URL
   ```

   **Value (Valor):**
   ```
   https://www.redcreativa.pro
   ```

   **Environments (Entornos):**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. Haz clic en **Save**

### 4. Redeploy la Aplicación

Después de agregar la variable, necesitas redeploy:

**Opción A - Redeploy Automático (Recomendado):**
1. Haz un commit y push de tus cambios:
   ```bash
   git add .
   git commit -m "fix: configurar sitemap para usar www"
   git push
   ```
2. Vercel detectará el push y redeployará automáticamente

**Opción B - Redeploy Manual:**
1. En Vercel Dashboard, ve a la pestaña **Deployments**
2. Encuentra el último deployment exitoso
3. Haz clic en el menú (⋯) al lado derecho
4. Selecciona **Redeploy**
5. Confirma el redeploy

### 5. Verifica el Deploy

1. Espera 5-10 minutos para que el deploy complete
2. Ve a la pestaña **Deployments**
3. Verifica que el estado sea **Ready** (verde)
4. Haz clic en **Visit** para ver tu sitio

### 6. Verifica el Sitemap

Después del deploy, verifica que el sitemap funcione:

```bash
# Desde tu terminal local
node verify-sitemap.js
```

Deberías ver:
- ✅ Status Code: 200
- ✅ Content-Type: application/xml
- ✅ Todas las URLs usan https://www.redcreativa.pro
- ✅ No hay URLs duplicadas

### 7. Verifica robots.txt

Visita en tu navegador:
```
https://www.redcreativa.pro/robots.txt
```

Deberías ver:
```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://www.redcreativa.pro/sitemap.xml
Host: https://www.redcreativa.pro
```

## 🔍 Verificación Completa

### Checklist de Verificación

- [ ] Variable `NEXT_PUBLIC_SITE_URL` agregada en Vercel
- [ ] Variable configurada para Production, Preview y Development
- [ ] Redeploy completado exitosamente
- [ ] Sitemap accesible en https://www.redcreativa.pro/sitemap.xml
- [ ] robots.txt accesible y correcto
- [ ] Todas las URLs en el sitemap usan www.redcreativa.pro
- [ ] No hay errores en los logs de Vercel

### Comandos de Verificación

```bash
# 1. Verificar configuración del dominio
node check-domain-config.js

# 2. Verificar sitemap
node verify-sitemap.js

# 3. Verificar robots.txt
curl https://www.redcreativa.pro/robots.txt

# 4. Verificar una URL del sitemap
curl -I https://www.redcreativa.pro/sitemap.xml
```

## 🐛 Solución de Problemas

### Problema: Variable no aparece después de agregarla

**Solución:**
1. Refresca la página de Vercel
2. Verifica que guardaste la variable (botón Save)
3. Verifica que seleccionaste los entornos correctos

### Problema: Sitemap sigue usando dominio antiguo

**Solución:**
1. Verifica que hiciste redeploy después de agregar la variable
2. Espera 10-15 minutos para que el cache se limpie
3. Limpia el cache de tu navegador (Ctrl+Shift+R)
4. Verifica en modo incógnito

### Problema: Deploy falla

**Solución:**
1. Ve a Deployments → Haz clic en el deploy fallido
2. Revisa los logs para ver el error
3. Verifica que todas las variables de entorno necesarias estén configuradas
4. Intenta redeploy nuevamente

### Problema: 404 en sitemap.xml

**Solución:**
1. Verifica que el archivo `app/sitemap.ts` existe
2. Verifica que no hay errores de TypeScript
3. Revisa los logs del build en Vercel
4. Asegúrate de que Next.js está generando el sitemap correctamente

## 📊 Otras Variables Importantes

Mientras estás en Environment Variables, verifica que también tengas:

### Variables Requeridas:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Para autenticación
- `CLERK_SECRET_KEY` - Para autenticación
- `GEMINI_API_KEY` - Para IA
- `KV_URL` - Para almacenamiento
- `KV_REST_API_URL` - Para almacenamiento
- `KV_REST_API_TOKEN` - Para almacenamiento

### Variables Opcionales:
- `GMAIL_USER` - Para envío de emails
- `GMAIL_APP_PASSWORD` - Para envío de emails
- `STRIPE_SECRET_KEY` - Para pagos
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Para pagos
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Para analytics
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - Para analytics

## 🎉 Siguiente Paso

Una vez que todo esté verificado:

1. Ve a Google Search Console
2. Elimina el sitemap antiguo (si existe)
3. Añade el nuevo sitemap: `https://www.redcreativa.pro/sitemap.xml`
4. Espera 24-48 horas para que Google lo procese

---

**Creado**: 22 de diciembre de 2025
**Última actualización**: 22 de diciembre de 2025
