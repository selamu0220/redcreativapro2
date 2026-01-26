# 📋 Paso a Paso - Configurar Kinde (VISUAL)

## ✅ Tu URL de Login es Correcta
`https://redcreativa.pro/api/auth/login` ← Esta es correcta ✓

## 🎯 El Problema
Kinde dice que falta el **callback URL** (no el login URL).

## 📝 Lo que Debes Hacer en Kinde Dashboard

### Paso 1: Estás en la página correcta
Ya estás en la configuración de tu aplicación en Kinde.

### Paso 2: Busca estos campos y llénalos

```
┌─────────────────────────────────────────────────────┐
│  Red Creativa Pro                          [Save]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📍 Application homepage URI (opcional)             │
│  ┌─────────────────────────────────────────────┐   │
│  │ https://redcreativa.pro                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📍 Application login URI (opcional)                │
│  ┌─────────────────────────────────────────────┐   │
│  │ https://redcreativa.pro/api/auth/login      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📍 Allowed callback URLs ⚠️ IMPORTANTE             │
│  ┌─────────────────────────────────────────────┐   │
│  │ https://redcreativa.pro/api/auth/kinde_ca...│   │ ← Ya lo pusiste
│  │ http://localhost:3000/api/auth/kinde_call...│   │ ← Agregar este
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📍 Allowed logout redirect URLs                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ https://redcreativa.pro                     │   │ ← Agregar este
│  │ http://localhost:3000                       │   │ ← Agregar este
│  └─────────────────────────────────────────────┘   │
│                                                     │
│                                    [Save] ← CLIC    │
└─────────────────────────────────────────────────────┘
```

### Paso 3: URLs Exactas para Copiar y Pegar

#### En "Allowed callback URLs":
```
https://redcreativa.pro/api/auth/kinde_callback
http://localhost:3000/api/auth/kinde_callback
```

#### En "Allowed logout redirect URLs":
```
https://redcreativa.pro
http://localhost:3000
```

### Paso 4: GUARDAR
1. Busca el botón **"Save"** (arriba a la derecha o abajo)
2. Haz clic
3. Espera a que se guarde (verás un mensaje de confirmación)

## 🔍 Cómo Saber si lo Hiciste Bien

Después de guardar:
1. Ve a https://redcreativa.pro
2. Haz clic en "Iniciar Sesión"
3. Deberías ver la pantalla de login de Kinde (no el error)

## ⚠️ Nota Importante

El error que ves dice:
> "Invalid callback URL"

Esto significa que Kinde está rechazando la conexión porque **NO ENCUENTRA** la URL en su configuración. Una vez que la agregues y guardes, funcionará inmediatamente.

## 🆘 Si Sigues Viendo el Error

1. Verifica que guardaste los cambios (botón "Save")
2. Espera 30 segundos (a veces tarda en propagarse)
3. Limpia el cache del navegador (Ctrl + Shift + Delete)
4. Intenta de nuevo
