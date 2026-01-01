# Solución: Error "Authentication not configured"

## Problema
Al intentar iniciar sesión o registrarse, aparece el error:
```json
{"error":"Authentication not configured"}
```

## Causa
El servidor de desarrollo de Next.js no ha cargado las variables de entorno de Kinde porque:
1. Las variables se agregaron/modificaron después de iniciar el servidor
2. El servidor necesita reiniciarse para cargar `.env.local`

## Solución

### Paso 1: Verificar Variables de Entorno
Ejecuta el script de verificación:
```bash
node verify-kinde-env.js
```

Deberías ver:
```
✅ Todas las variables de Kinde están configuradas correctamente
```

### Paso 2: Reiniciar el Servidor de Desarrollo

**IMPORTANTE:** Debes detener completamente el servidor actual y reiniciarlo.

#### Opción A: Detener con Ctrl+C
1. En la terminal donde corre `npm run dev`, presiona `Ctrl+C`
2. Espera a que el proceso termine completamente
3. Ejecuta nuevamente:
   ```bash
   npm run dev
   ```

#### Opción B: Matar el proceso (si Ctrl+C no funciona)
```powershell
# Buscar el proceso de Node
Get-Process node | Stop-Process -Force

# Reiniciar
npm run dev
```

### Paso 3: Verificar que Funcione

1. Abre tu navegador en `http://localhost:3000`
2. Haz clic en "Iniciar Sesión" o "Registrarse"
3. Deberías ser redirigido a: `https://selamu.kinde.com`
4. Completa el login/registro en Kinde
5. Serás redirigido de vuelta a `http://localhost:3000/dashboard`

## Verificación de la Configuración

### Variables de Entorno Correctas (en .env.local)
```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

### URLs de Autenticación
- **Login**: `http://localhost:3000/api/auth/login`
- **Register**: `http://localhost:3000/api/auth/register`
- **Logout**: `http://localhost:3000/api/auth/logout`
- **Callback**: `http://localhost:3000/api/auth/kinde_callback`

## Configuración de Kinde Dashboard

Asegúrate de que tu Kinde Dashboard tenga configuradas estas URLs:

### Allowed callback URLs
```
http://localhost:3000/api/auth/kinde_callback
https://redcreativa.pro/api/auth/kinde_callback
```

### Allowed logout redirect URLs
```
http://localhost:3000
https://redcreativa.pro
```

## Troubleshooting

### Error persiste después de reiniciar
1. Verifica que el archivo `.env.local` existe en la raíz del proyecto
2. Verifica que no haya espacios extra en las variables
3. Asegúrate de que el puerto 3000 esté libre:
   ```powershell
   netstat -ano | findstr :3000
   ```

### Error "Cannot destructure property 'params'"
Este error ya fue solucionado. Si aparece, verifica que `app/api/auth/[kindeAuth]/route.ts` tenga el código actualizado.

### Redirección a Clerk en lugar de Kinde
Verifica que no haya referencias a `accounts.redcreativa.pro` en el código:
```bash
node verify-no-clerk.js
```

## Comandos Útiles

### Verificar variables de Kinde
```bash
node verify-kinde-env.js
```

### Verificar que no haya Clerk
```bash
node verify-no-clerk.js
```

### Limpiar caché de Next.js
```bash
Remove-Item -Recurse -Force .next
npm run dev
```

### Ver logs del servidor
El servidor mostrará en consola si las variables están cargadas:
```
[Kinde Auth] Environment variables configured
```

O si faltan:
```
[Kinde Auth] Environment variables not configured
```

## Notas Importantes

1. **Siempre reinicia el servidor** después de cambiar variables de entorno
2. `.env.local` NO se sube a Git (está en .gitignore)
3. En producción (Vercel), configura las variables en el dashboard de Vercel
4. Las variables que empiezan con `NEXT_PUBLIC_` son accesibles en el cliente
5. Las variables sin `NEXT_PUBLIC_` solo están disponibles en el servidor

## Estado Actual

✅ Variables de Kinde configuradas en `.env.local`
✅ Variables de Clerk eliminadas
✅ URLs actualizadas para usar Kinde
✅ Código migrado a Kinde Auth

**Siguiente paso:** Reiniciar el servidor de desarrollo
