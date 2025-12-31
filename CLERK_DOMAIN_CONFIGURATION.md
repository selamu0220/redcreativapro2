# Configuración de Clerk - Dominio de Aplicación

## ✅ Cambios Realizados

### 1. Variables de Entorno Actualizadas

Se han agregado las siguientes variables en `.env.local` y `.env.example`:

```env
# Clerk Routes - Application Domain (not Account Portal)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Componente de Autenticación Actualizado

El componente `AuthPageClient.tsx` ahora usa `afterSignInUrl` y `afterSignUpUrl` en lugar de `fallbackRedirectUrl`.

## 🔧 Configuración en Clerk Dashboard

Ahora necesitas configurar estas rutas en el Dashboard de Clerk:

### Paso 1: Acceder a Paths Configuration

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecciona tu aplicación: **redcreativapro2**
3. En el menú lateral, ve a: **Configure** → **Paths**

### Paso 2: Configurar Application Paths

#### Home URL
```
https://www.redcreativa.pro
```

#### Unauthorized sign in URL
```
https://www.redcreativa.pro/auth
```

### Paso 3: Configurar Component Paths

#### Sign In (`<SignIn />`)
- **Opción seleccionada**: ✅ Sign-in page on application domain
- **URL**: `https://www.redcreativa.pro/auth`

#### Sign Up (`<SignUp />`)
- **Opción seleccionada**: ✅ Sign-up page on application domain
- **URL**: `https://www.redcreativa.pro/auth`

#### Signing Out
- **Opción seleccionada**: ✅ Path on application domain
- **URL**: `https://www.redcreativa.pro/auth`

### Paso 4: Guardar Cambios

Haz clic en **Save** en la parte inferior de la página.

## 📋 Variables de Entorno en Vercel

Asegúrate de agregar estas variables en tu proyecto de Vercel:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

5. Marca las variables para todos los entornos: **Production**, **Preview**, **Development**
6. Haz clic en **Save**

## 🚀 Desplegar Cambios

Después de configurar todo:

```bash
# Commit los cambios
git add .
git commit -m "Configure Clerk to use application domain instead of Account Portal"

# Push a producción
git push origin main
```

Vercel desplegará automáticamente los cambios.

## ✅ Verificación

Una vez desplegado, verifica que:

1. Al acceder a `https://www.redcreativa.pro/auth` veas el formulario de login/registro
2. Al iniciar sesión, seas redirigido a `/dashboard`
3. Al registrarte, seas redirigido a `/dashboard`
4. No seas redirigido al Account Portal de Clerk

## 🔍 Troubleshooting

### Si sigues siendo redirigido al Account Portal:

1. Verifica que las variables de entorno estén correctamente configuradas en Vercel
2. Asegúrate de haber guardado los cambios en Clerk Dashboard
3. Limpia la caché de Vercel:
   ```bash
   vercel --prod --force
   ```
4. Espera unos minutos para que los cambios se propaguen

### Si ves errores de autenticación:

1. Verifica que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` estén correctamente configuradas
2. Asegúrate de que el dominio `www.redcreativa.pro` esté agregado en Clerk Dashboard bajo **Configure** → **Domains**

## 📚 Documentación Adicional

- [Clerk Paths Documentation](https://clerk.com/docs/references/nextjs/custom-signup-signin-pages)
- [Clerk Environment Variables](https://clerk.com/docs/deployments/clerk-environment-variables)
