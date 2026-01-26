# 🔐 Configuración Completa de Kinde para Producción

## ✅ Checklist de Configuración

### 1. Variables de Entorno en Vercel

Ve a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

Configura estas variables para el entorno **Production**:

```env
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

**IMPORTANTE:** 
- ❌ NO uses `http://localhost:3000` en producción
- ✅ USA `https://redcreativa.pro` (sin www)
- ✅ Asegúrate de seleccionar "Production" al agregar las variables

### 2. Configuración en Kinde Dashboard

Ve a: **https://selamu.kinde.com → Settings → Applications → Red Creativa Pro**

#### Allowed callback URLs
Agrega estas URLs (una por línea):
```
https://redcreativa.pro/api/auth/kinde_callback
http://localhost:3000/api/auth/kinde_callback
```

#### Allowed logout redirect URLs
Agrega estas URLs (una por línea):
```
https://redcreativa.pro
http://localhost:3000
```

#### Application homepage URI (opcional)
```
https://redcreativa.pro
```

#### Application login URI (opcional)
```
https://redcreativa.pro/api/auth/login
```

### 3. Verificar Archivos del Proyecto

#### ✅ app/api/auth/[kindeAuth]/route.ts
```typescript
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string }> }
) {
  await context.params;
  const handler = handleAuth();
  return handler(request, context);
}
```

#### ✅ app/components/Providers.tsx
```typescript
'use client'

import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs"
import ErrorBoundary from './ErrorBoundary'

export const Providers = function Providers({ children }) {
  return (
    <KindeProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </KindeProvider>
  )
}
```

#### ✅ middleware.ts
```typescript
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  
  const protectedPaths = [
    '/dashboard',
    '/escritor-ia',
    '/correos-ia',
    // ... otras rutas protegidas
  ];
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    return withAuth(req);
  }
  
  return NextResponse.next();
}
```

### 4. Componentes de Login/Logout

Usa los componentes oficiales de Kinde:

```typescript
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

// En tu navegación
<LoginLink>Iniciar sesión</LoginLink>
<RegisterLink>Registrarse</RegisterLink>
<LogoutLink>Cerrar sesión</LogoutLink>
```

### 5. Obtener Datos del Usuario

#### En Server Components:
```typescript
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Dashboard() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }
  
  const user = await getUser();
  return <div>Hola {user.given_name}</div>;
}
```

#### En Client Components:
```typescript
'use client'

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useKindeBrowserClient();
  
  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <div>No autenticado</div>;
  
  return <div>Hola {user.given_name}</div>;
}
```

## 🚀 Pasos para Desplegar

1. **Actualiza las variables en Vercel**
   - Ve a Settings → Environment Variables
   - Actualiza las 3 URLs de Kinde
   - Selecciona "Production"

2. **Actualiza las URLs en Kinde Dashboard**
   - Agrega las callback URLs
   - Agrega las logout redirect URLs

3. **Commit y Push** (si hiciste cambios en el código)
   ```bash
   git add .
   git commit -m "fix: configurar Kinde para producción"
   git push
   ```

4. **Redeploy en Vercel**
   - Ve a Deployments
   - Click en "Redeploy" en el último deployment
   - O espera el auto-deploy si hiciste push

5. **Prueba el Login**
   - Ve a https://redcreativa.pro
   - Click en "Iniciar sesión"
   - Deberías ser redirigido a Kinde
   - Después del login, vuelves a /dashboard

## 🔍 Verificación

### Health Check
Visita: `https://redcreativa.pro/api/auth/health`

Deberías ver algo como:
```json
{
  "apiPath": "/api/auth",
  "redirectURL": "https://redcreativa.pro/api/auth/kinde_callback",
  "postLoginRedirectURL": "https://redcreativa.pro/dashboard",
  "issuerURL": "https://selamu.kinde.com",
  "clientID": "5065812b70004d75809f8d535cb0daa6",
  "clientSecret": "Set correctly",
  "postLogoutRedirectURL": "https://redcreativa.pro"
}
```

### Verificar Variables Localmente
```bash
node verify-kinde-production.js
```

## ❌ Errores Comunes

### Error: "State not found"
**Causa:** Las URLs de KINDE_SITE_URL y KINDE_POST_LOGIN_REDIRECT_URL no coinciden con el dominio desde donde inicias el login.

**Solución:** Asegúrate de que todas las URLs en Vercel usen `https://redcreativa.pro`

### Error 500 al hacer login
**Causa:** Variables de entorno incorrectas o URLs no configuradas en Kinde Dashboard.

**Solución:** 
1. Verifica que las variables en Vercel estén correctas
2. Verifica que las callback URLs estén en Kinde Dashboard
3. Redeploy después de cambiar variables

### Redirect loop
**Causa:** Middleware protegiendo rutas de auth o configuración incorrecta.

**Solución:** Asegúrate de que `/api/auth/*` NO esté en las rutas protegidas del middleware.

## 📚 Recursos

- [Kinde Next.js Docs](https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/)
- [Kinde Dashboard](https://selamu.kinde.com)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 🆘 Soporte

Si después de seguir estos pasos sigue sin funcionar:

1. Revisa los logs en Vercel: Deployments → [último deployment] → Function Logs
2. Busca errores relacionados con "kinde", "auth", o "callback"
3. Verifica que el CLIENT_SECRET sea correcto (no lo compartas públicamente)
4. Contacta a soporte de Kinde si el problema persiste
