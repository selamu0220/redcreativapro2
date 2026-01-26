# Guía de Build Móvil - Escritor IA

## Problema Resuelto

El error `No dist found in root of project` ocurría porque:
- **Fastlane/Capacitor** esperaba encontrar archivos en la carpeta `dist/`
- **Next.js** por defecto construye en `.next/` (no en `dist/`)
- Las rutas API no son compatibles con builds estáticos móviles

## Solución Implementada

### 1. Build Híbrido
- ✅ Next.js hace build normal (mantiene funcionalidad completa)
- ✅ Script personalizado copia archivos necesarios a `dist/`
- ✅ Capacitor encuentra los archivos donde los espera

### 2. Archivos Clave

#### `build-mobile.js`
- Copia archivos estáticos de `.next/static` a `dist/_next/static`
- Mantiene `index.html` optimizado para móvil
- Preserva `manifest.json` para PWA

#### `package.json` - Nuevo Script
```json
"build:mobile": "next build && node build-mobile.js"
```

### 3. Estructura Final
```
dist/
├── _next/
│   └── static/          # Archivos JS/CSS de Next.js
├── index.html           # Página optimizada para móvil
└── manifest.json        # Configuración PWA
```

## Comandos de Build

### Para Desarrollo Web
```bash
npm run build
npm start
```

### Para Build Móvil
```bash
npm run build:mobile     # Genera dist/ para Capacitor
npm run mobile:sync      # Sincroniza con Android
npm run mobile:build     # Construye APK
```

## CI/CD

En tu pipeline de CI/CD, usa:
```bash
npm run build:mobile
```

Esto asegura que:
1. ✅ Next.js compile correctamente
2. ✅ La carpeta `dist/` exista
3. ✅ Fastlane pueda proceder sin errores

## Ventajas de Esta Solución

- 🔄 **Compatibilidad**: Mantiene funcionalidad completa de Next.js
- 📱 **Móvil**: Genera archivos específicos para Capacitor
- 🚀 **CI/CD**: Resuelve errores de build automático
- 🛠️ **Mantenible**: Un solo comando para build móvil

## Troubleshooting

Si el error persiste:
1. Verifica que `dist/` existe después del build
2. Confirma que `capacitor.config.ts` apunta a `webDir: 'dist'`
3. Ejecuta `npm run build:mobile` antes de `mobile:build`