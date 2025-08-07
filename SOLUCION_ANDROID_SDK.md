# 🔧 Solución para Configurar Android SDK

## Problema
El build de Android falla con el error:
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
```

## 📱 Solución Recomendada: Instalar Android Studio

### Paso 1: Descargar Android Studio
1. Ve a: https://developer.android.com/studio
2. Descarga Android Studio para Windows
3. Ejecuta el instalador como administrador

### Paso 2: Configuración Inicial
1. Abre Android Studio
2. Sigue el asistente de configuración inicial
3. **IMPORTANTE**: Acepta todas las licencias cuando se te solicite
4. Permite que descargue e instale el Android SDK

### Paso 3: Verificar Instalación
El SDK se instalará automáticamente en:
```
C:\Users\programar\AppData\Local\Android\Sdk
```

### Paso 4: Configurar Variables de Entorno (Opcional)
Si es necesario, configura manualmente:

1. **ANDROID_HOME**:
   - Abre "Variables de entorno" en Windows
   - Agrega nueva variable de usuario:
     - Nombre: `ANDROID_HOME`
     - Valor: `C:\Users\programar\AppData\Local\Android\Sdk`

2. **PATH**:
   - Agrega estas rutas al PATH:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\cmdline-tools\latest\bin`

## 🚀 Alternativa Rápida: Solo SDK Command Line Tools

Si no quieres instalar Android Studio completo:

### Paso 1: Crear Directorios
```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\programar\AppData\Local\Android\Sdk"
New-Item -ItemType Directory -Force -Path "C:\Users\programar\AppData\Local\Android\Sdk\cmdline-tools"
```

### Paso 2: Descargar SDK Tools
1. Ve a: https://developer.android.com/studio#command-tools
2. Descarga "Command line tools only" para Windows
3. Extrae el archivo ZIP
4. Mueve la carpeta `cmdline-tools` a:
   ```
   C:\Users\programar\AppData\Local\Android\Sdk\cmdline-tools\latest
   ```

### Paso 3: Instalar Componentes
Abre PowerShell como administrador y ejecuta:
```powershell
cd "C:\Users\programar\AppData\Local\Android\Sdk\cmdline-tools\latest\bin"
.\sdkmanager.bat --licenses
.\sdkmanager.bat "platform-tools"
.\sdkmanager.bat "build-tools;34.0.0"
.\sdkmanager.bat "platforms;android-34"
```

## ✅ Verificar Configuración

Después de cualquiera de las opciones anteriores:

1. **Verificar que existe el archivo local.properties**:
   ```
   C:\Users\programar\Documents\GitHub\redcreativapro3\android\local.properties
   ```
   
2. **El archivo debe contener**:
   ```
   sdk.dir=C:\\Users\\programar\\AppData\\Local\\Android\\Sdk
   ```

3. **Verificar que existe el SDK**:
   ```
   C:\Users\programar\AppData\Local\Android\Sdk\platform-tools
   C:\Users\programar\AppData\Local\Android\Sdk\build-tools
   ```

## 🔄 Continuar con el Build

Una vez configurado el Android SDK:

```bash
# Opción 1: Usar el script automático
.\build-android.bat

# Opción 2: Comandos manuales
npm run build:ionic
npx cap sync android
npx cap build android
```

## 🆘 Solución de Problemas

### Error: "ANDROID_HOME not set"
- Reinicia tu terminal/PowerShell
- Verifica las variables de entorno
- Asegúrate de que el SDK esté instalado en la ruta correcta

### Error: "Gradle build failed"
- Acepta las licencias del SDK: `sdkmanager --licenses`
- Verifica que tienes Java JDK 17 instalado
- Limpia el proyecto: `cd android && .\gradlew clean`

### Error: "Build tools not found"
- Instala build-tools: `sdkmanager "build-tools;34.0.0"`
- Verifica la versión en `android/app/build.gradle`

## 📞 Contacto

Si sigues teniendo problemas, verifica:
1. ✅ Java JDK 17 instalado
2. ✅ Android SDK instalado
3. ✅ Variables de entorno configuradas
4. ✅ Licencias aceptadas
5. ✅ Terminal reiniciado

---

**Nota**: La instalación de Android Studio es la opción más confiable ya que configura automáticamente todo lo necesario.