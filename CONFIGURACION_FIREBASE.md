# Configuración de Firebase para Red Creativa Pro

## ¿Por qué no puedes iniciar sesión?

El problema es que la aplicación está usando credenciales de Firebase de ejemplo (con XXXX) en lugar de credenciales reales de un proyecto de Firebase configurado.

## Pasos para solucionar el problema:

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto" o "Add project"
3. Nombra tu proyecto (ej: "red-creativa-pro")
4. Sigue los pasos de configuración

### 2. Configurar Authentication

1. En tu proyecto de Firebase, ve a **Authentication** en el menú lateral
2. Haz clic en **Get started** si es la primera vez
3. Ve a la pestaña **Sign-in method**
4. Habilita **Email/Password**:
   - Haz clic en "Email/Password"
   - Activa la primera opción (Email/Password)
   - Guarda los cambios

### 3. Configurar dominio autorizado

1. En **Authentication > Settings > Authorized domains**
2. Asegúrate de que `localhost` esté en la lista
3. Si no está, agrégalo haciendo clic en "Add domain"

### 4. Obtener la configuración de tu proyecto

1. Ve a **Project Settings** (ícono de engranaje)
2. Baja hasta la sección **Your apps**
3. Haz clic en **Add app** y selecciona **Web** (ícono </>
4. Registra tu app con un nombre (ej: "Red Creativa Pro Web")
5. Copia la configuración que aparece (firebaseConfig)

### 5. Actualizar el archivo firebase.ts

Reemplaza el contenido del archivo `app/firebase.ts` con tu configuración real:

```typescript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.firebasestorage.app",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
```

### 6. Crear tu primera cuenta

Una vez configurado Firebase:

1. Ve a `http://localhost:3004/auth`
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Ingresa un email y contraseña (mínimo 6 caracteres)
4. Haz clic en "Crear Cuenta"

## Verificación

Puedes verificar que todo funciona:

1. En Firebase Console > Authentication > Users
2. Deberías ver tu usuario recién creado
3. Podrás iniciar y cerrar sesión normalmente

## Problemas comunes

- **"Firebase: Error (auth/invalid-api-key)"**: Tu API key no es válida
- **"Firebase: Error (auth/project-not-found)"**: El Project ID es incorrecto
- **"Firebase: Error (auth/unauthorized-domain)"**: localhost no está autorizado

## Alternativa para pruebas rápidas

Si solo quieres probar la aplicación sin configurar Firebase:

1. Puedes usar Firebase Emulator Suite para desarrollo local
2. O modificar temporalmente el código para saltarse la autenticación

¿Necesitas ayuda con algún paso específico?