# Migración de Clerk a Kinde Auth

## Plan de Migración

### 1. Instalación de Kinde
- Instalar `@kinde-oss/kinde-auth-nextjs`
- Desinstalar `@clerk/nextjs`

### 2. Configuración de Variables de Entorno
Reemplazar variables de Clerk con Kinde:
- `KINDE_CLIENT_ID`
- `KINDE_CLIENT_SECRET`
- `KINDE_ISSUER_URL`
- `KINDE_SITE_URL`
- `KINDE_POST_LOGOUT_REDIRECT_URL`
- `KINDE_POST_LOGIN_REDIRECT_URL`

### 3. Archivos a Modificar

#### Archivos principales:
- `app/layout.tsx` - Reemplazar ClerkProvider con KindeProvider
- `middleware.ts` - Actualizar middleware de autenticación
- `app/hooks/useAuth.ts` - Cambiar de Clerk a Kinde hooks
- `app/components/AuthProvider.tsx` - Actualizar provider
- `app/components/AuthPageClient.tsx` - Reemplazar componentes de login
- `app/components/CustomUserMenu.tsx` - Actualizar menú de usuario
- `app/lib/auth/AuthenticationGuard.ts` - Cambiar verificación de auth

#### Hooks que usan Clerk:
- `app/hooks/useOpenRouterSync.ts`
- `app/hooks/usePremiumAccess.ts`
- `app/hooks/useUserStats.ts`
- `app/hooks/useSubscriptionStatus.ts`
- `app/hooks/useSubscription.ts`

#### Páginas:
- `app/auth/page.tsx`
- `app/dashboard/page.tsx`
- `app/planes/page.tsx`
- `app/subscription/manage/page.tsx`
- `app/test-clerk/page.tsx` (eliminar)

### 4. Archivos de Documentación a Eliminar
- `CLERK_SETUP_CHECKLIST.md`
- `CLERK_DASHBOARD_SETUP.md`
- `CLERK_DOMAIN_CONFIGURATION.md`
- `CLERK_ONLY_ARCHITECTURE.md`
- `diagnose-clerk-loading.js`
- `verify-clerk-config.js`

## Estado: En Progreso
