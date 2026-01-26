# Credenciales de Kinde - IMPORTANTE

## ⚠️ ACCIÓN REQUERIDA

Necesitas copiar el **Client Secret** desde el dashboard de Kinde.

### Pasos:

1. Ve a: https://app.kinde.com/applications
2. Selecciona tu aplicación "My NextJS App"
3. En la sección de credenciales, copia el **Client Secret**
4. Abre `.env.local` y reemplaza `** Hidden until copied **` con el valor real

### Credenciales Actuales:

```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=<COPIAR_DESDE_DASHBOARD>
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

### Para Producción (Vercel):

Añade estas variables en Vercel Dashboard:

```bash
KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
KINDE_CLIENT_SECRET=<TU_CLIENT_SECRET>
KINDE_ISSUER_URL=https://selamu.kinde.com
KINDE_SITE_URL=https://www.redcreativa.pro
KINDE_POST_LOGOUT_REDIRECT_URL=https://www.redcreativa.pro
KINDE_POST_LOGIN_REDIRECT_URL=https://www.redcreativa.pro/dashboard
```

### Verificar Callbacks en Kinde Dashboard:

Asegúrate de tener configuradas estas URLs en tu aplicación de Kinde:

**Allowed callback URLs:**
```
http://localhost:3000/api/auth/kinde_callback
https://www.redcreativa.pro/api/auth/kinde_callback
```

**Allowed logout redirect URLs:**
```
http://localhost:3000
https://www.redcreativa.pro
```

## Una vez configurado:

```bash
npm run dev
```

Y prueba en: http://localhost:3000/auth
