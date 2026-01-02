# 🚀 Kinde - Referencia Rápida

## URLs de Producción (Vercel)

```env
KINDE_SITE_URL=https://redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
```

## URLs en Kinde Dashboard

**Callback URLs:**
```
https://redcreativa.pro/api/auth/kinde_callback
```

**Logout Redirect URLs:**
```
https://redcreativa.pro
```

## Componentes de Auth

```typescript
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

<LoginLink>Iniciar sesión</LoginLink>
<RegisterLink>Registrarse</RegisterLink>
<LogoutLink>Cerrar sesión</LogoutLink>
```

## Obtener Usuario (Server)

```typescript
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getUser, isAuthenticated } = getKindeServerSession();
const user = await getUser();
const isAuth = await isAuthenticated();
```

## Obtener Usuario (Client)

```typescript
'use client'
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

const { user, isLoading, isAuthenticated } = useKindeBrowserClient();
```

## Health Check

```
https://redcreativa.pro/api/auth/health
```

## Rutas de Auth

- Login: `/api/auth/login`
- Logout: `/api/auth/logout`
- Register: `/api/auth/register`
- Callback: `/api/auth/kinde_callback`

## Troubleshooting

### Error 500 al login
✅ Verifica variables en Vercel
✅ Verifica callback URLs en Kinde
✅ Redeploy

### "State not found"
✅ URLs deben coincidir exactamente
✅ No mezclar localhost con producción

### Redirect loop
✅ No proteger `/api/auth/*` en middleware
