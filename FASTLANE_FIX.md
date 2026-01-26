# 🚀 Solución Definitiva para Error "No dist found" en Fastlane/CI/CD

## 🔥 Problema
Fastlane/Ionic Appflow busca el directorio `dist/` pero Next.js genera `.next/`

## ✅ Solución Implementada

### 1. **Build Override Automático**
- `build-override.js` detecta automáticamente el entorno CI/CD
- `package.json` usa `"build": "node build-override.js || next build"`
- **Resultado**: `npm run build` siempre genera `dist/` en CI/CD

### 2. **Configuración Capacitor**
- `capacitor.config.json` especifica `"webDir": "dist"`
- `ionic.config.json` configura el comando de build correcto

### 3. **Scripts Disponibles**
```bash
# Para CI/CD (automático)
npm run build          # Detecta entorno y usa build correcto

# Para desarrollo local
npm run build:web      # Build web estándar (.next/)
npm run build:ionic    # Build móvil (dist/)
npm run build:mobile   # Build móvil alternativo
```

## 🤖 Para CI/CD Systems

### GitLab CI
```yaml
build_mobile:
  script:
    - npm ci
    - npm run build  # Automáticamente usa build:ionic en CI
    - ls -la dist/   # Verificar
```

### GitHub Actions
```yaml
- name: Build for Mobile
  run: |
    npm ci
    npm run build  # Automáticamente usa build:ionic en CI
    ls -la dist/
```

### Ionic Appflow
- **Build Command**: `npm run build`
- **Web Directory**: `dist`
- El sistema detecta automáticamente el entorno Ionic

## 🔍 Detección Automática

El script detecta entorno móvil si encuentra:
- `process.env.CI` (cualquier CI/CD)
- `process.env.GITLAB_CI` (GitLab)
- `process.env.GITHUB_ACTIONS` (GitHub)
- `process.env.CAPACITOR_WEB_DIR` (Capacitor)
- `process.env.IONIC_CLI_VERSION` (Ionic)
- `capacitor.config.json` existe
- Parámetro `--mobile`

## 📁 Estructura Final
```
proyecto/
├── dist/                    # ✅ Para Capacitor/Fastlane
│   ├── index.html
│   ├── manifest.json
│   └── _next/
├── .next/                   # Para Next.js web
├── capacitor.config.json    # ✅ webDir: "dist"
├── ionic.config.json        # ✅ build: "npm run build:ionic"
├── build-override.js        # ✅ Detección automática
└── package.json             # ✅ build: "node build-override.js"
```

## 🎯 Ventajas

1. **Automático**: No requiere cambios en CI/CD
2. **Inteligente**: Detecta el entorno correcto
3. **Robusto**: Múltiples métodos de detección
4. **Compatible**: Funciona con todos los sistemas CI/CD
5. **Fallback**: Si falla, usa build web estándar

## 🚨 Si Aún Falla

1. **Verificar variables de entorno**:
   ```bash
   echo $CI
   echo $CAPACITOR_WEB_DIR
   echo $IONIC_CLI_VERSION
   ```

2. **Forzar build móvil**:
   ```bash
   npm run build:ionic
   ```

3. **Verificar archivos**:
   ```bash
   ls -la capacitor.config.json
   ls -la ionic.config.json
   ls -la build-override.js
   ```

4. **Debug del script**:
   ```bash
   node build-override.js
   ```

## 🎉 Resultado

✅ **ANTES**: `RuntimeError: No dist found in root of project`  
✅ **DESPUÉS**: Build exitoso con directorio `dist/` generado automáticamente

---

**💡 Tip**: Este sistema funciona automáticamente. Solo ejecuta `npm run build` en cualquier entorno y el script detectará si necesita build web o móvil.