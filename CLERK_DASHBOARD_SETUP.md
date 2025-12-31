# 🎯 Configuración de Clerk Dashboard - Guía Visual

## ✅ Estado Actual

- ✅ Variables de entorno configuradas en `.env.local`
- ✅ Componente de autenticación actualizado
- ✅ Página `/auth` lista para usar

## 🔧 Configuración en Clerk Dashboard

### 📍 Ubicación en el Dashboard

```
Personal workspace
  └── redcreativapro2
      └── Free
          └── production
              └── Configure
                  └── Paths  ← AQUÍ
```

---

## 📝 Configuración Paso a Paso

### 1️⃣ Application Paths

#### Home URL
```
https://www.redcreativa.pro
```
*Deja el campo vacío si tu homepage está en la raíz*

#### Unauthorized sign in URL
```
https://www.redcreativa.pro/auth
```

---

### 2️⃣ Component Paths

#### 🔐 Sign In (`<SignIn />`)

**Pregunta**: *Specify where to take a user for `<SignIn />`*

**Opciones disponibles**:
- ⚪ Sign-in page on Account Portal
- 🔵 **Sign-in page on application domain** ← SELECCIONA ESTA

**URL a ingresar**:
```
https://www.redcreativa.pro/auth
```

---

#### ✍️ Sign Up (`<SignUp />`)

**Pregunta**: *Specify where to take a user for `<SignUp />`*

**Opciones disponibles**:
- ⚪ Sign-up page on Account Portal
- 🔵 **Sign-up page on application domain** ← SELECCIONA ESTA

**URL a ingresar**:
```
https://www.redcreativa.pro/auth
```

---

#### 🚪 Signing Out

**Pregunta**: *Specify where to take a user after they sign out*

**Opciones disponibles**:
- ⚪ Sign-in page on Account Portal
- 🔵 **Path on application domain** ← SELECCIONA ESTA

**URL a ingresar**:
```
https://www.redcreativa.pro/auth
```

---

## ⚠️ Nota Importante

Verás este mensaje en el Dashboard:

> *"Setting component paths via the Dashboard will be deprecated in a future version of Clerk. Please consult the documentation on how to configure these URLs code-side."*

**No te preocupes**: Ya hemos configurado las URLs en el código con las variables de entorno. Esta configuración en el Dashboard es complementaria y asegura que todo funcione correctamente.

---

## 💾 Guardar Cambios

1. Revisa que todas las URLs estén correctas
2. Haz clic en el botón **Save** al final de la página
3. Espera la confirmación de que los cambios se guardaron

---

## 🌐 Configuración en Vercel

Después de configurar Clerk, agrega estas variables en Vercel:

### Paso 1: Acceder a Environment Variables

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: **redcreativapro2**
3. Ve a: **Settings** → **Environment Variables**

### Paso 2: Agregar Variables

Agrega cada una de estas variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/auth` | ✅ Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/auth` | ✅ Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | ✅ Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | ✅ Production, Preview, Development |

### Paso 3: Guardar y Redesplegar

1. Haz clic en **Save** para cada variable
2. Vercel te preguntará si quieres redesplegar
3. Haz clic en **Redeploy** para aplicar los cambios

---

## 🧪 Verificación

### Prueba Local

```bash
# Inicia el servidor de desarrollo
npm run dev

# Abre en el navegador
http://localhost:3001/auth
```

**Deberías ver**:
- ✅ Formulario de login/registro de Clerk
- ✅ Diseño personalizado con tu tema
- ✅ Botón para cambiar entre login y registro

### Prueba en Producción

```bash
# Despliega a producción
git add .
git commit -m "Configure Clerk application domain"
git push origin main
```

**Luego verifica**:
1. Ve a `https://www.redcreativa.pro/auth`
2. Intenta iniciar sesión
3. Verifica que seas redirigido a `/dashboard`
4. Cierra sesión
5. Verifica que seas redirigido a `/auth`

---

## ❓ Troubleshooting

### Problema: Sigo siendo redirigido al Account Portal

**Solución**:
1. Verifica que guardaste los cambios en Clerk Dashboard
2. Limpia la caché del navegador (Ctrl + Shift + Delete)
3. Espera 2-3 minutos para que los cambios se propaguen
4. Intenta en modo incógnito

### Problema: Error 404 en /auth

**Solución**:
1. Verifica que el archivo `app/auth/page.tsx` existe
2. Reinicia el servidor de desarrollo
3. Limpia la caché de Next.js: `rm -rf .next`

### Problema: Variables de entorno no funcionan

**Solución**:
1. Verifica que las variables estén en `.env.local`
2. Reinicia el servidor de desarrollo
3. En Vercel, verifica que las variables estén en todos los entornos
4. Redesplega el proyecto

---

## 📚 Recursos Adicionales

- [Clerk Custom Pages Documentation](https://clerk.com/docs/references/nextjs/custom-signup-signin-pages)
- [Clerk Environment Variables](https://clerk.com/docs/deployments/clerk-environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## ✨ Resultado Final

Una vez configurado correctamente:

- ✅ Los usuarios verán el formulario de login en `www.redcreativa.pro/auth`
- ✅ No serán redirigidos al Account Portal de Clerk
- ✅ Después de iniciar sesión, irán a `/dashboard`
- ✅ El diseño será consistente con tu aplicación
- ✅ Tendrás control total sobre la experiencia de autenticación

---

**¿Necesitas ayuda?** Revisa el archivo `CLERK_DOMAIN_CONFIGURATION.md` para más detalles técnicos.
