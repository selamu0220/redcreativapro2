# Guía para Convertir la App Next.js a APK Android

## ✅ Configuración Completada

Ya se ha configurado tu proyecto Next.js para generar una APK de Android usando Capacitor:

- ✅ Capacitor instalado y configurado
- ✅ Plataforma Android añadida
- ✅ Archivos web sincronizados
- ✅ Configuración optimizada para móvil

## 📋 Requisitos Previos

Para completar la construcción del APK, necesitas instalar:

### 1. Java Development Kit (JDK)
```bash
# Descargar e instalar JDK 11 o superior desde:
# https://adoptium.net/temurin/releases/

# Verificar instalación:
java -version
```

### 2. Android Studio
```bash
# Descargar desde: https://developer.android.com/studio
# Durante la instalación, asegúrate de incluir:
# - Android SDK
# - Android SDK Platform-Tools
# - Android Virtual Device (AVD)
```

### 3. Variables de Entorno
Añadir a las variables de entorno del sistema:
```
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.0.x.x-hotspot
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# Añadir al PATH:
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

## 🚀 Comandos para Construir la APK

Una vez instalados los requisitos:

### Método 1: Construcción Automática
```bash
# Sincronizar cambios
npx cap sync android

# Construir APK
npx cap build android
```

### Método 2: Usando Android Studio
```bash
# Abrir proyecto en Android Studio
npx cap open android

# En Android Studio:
# 1. Build > Generate Signed Bundle / APK
# 2. Seleccionar APK
# 3. Seguir el asistente
```

### Método 3: Gradle Directo
```bash
# Navegar al directorio android
cd android

# Construir APK de debug
.\gradlew assembleDebug

# Construir APK de release
.\gradlew assembleRelease
```

## 📱 Ubicación del APK

Una vez construido, encontrarás el APK en:
```
android/app/build/outputs/apk/debug/app-debug.apk
# o
android/app/build/outputs/apk/release/app-release.apk
```

## 🔧 Configuración Adicional

### Personalizar Icono de la App
1. Reemplaza los iconos en: `android/app/src/main/res/mipmap-*/`
2. Usa herramientas como [Icon Kitchen](https://icon.kitchen/) para generar todos los tamaños

### Configurar Permisos
Edita `android/app/src/main/AndroidManifest.xml` para añadir permisos:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Configurar Firma de Release
Para distribución, crea un keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

## 🌐 Conexión con la App Web

La app móvil actual está configurada como un launcher que:
- Muestra una interfaz nativa atractiva
- Se conecta a tu aplicación web desplegada
- Funciona como una Progressive Web App (PWA)

### Para una Integración Completa
Si quieres que la app funcione completamente offline:
1. Configura las APIs para trabajar con datos locales
2. Implementa sincronización cuando hay conexión
3. Usa plugins de Capacitor para funcionalidades nativas

## 🛠️ Scripts de Construcción

Puedes usar estos scripts una vez instalados los requisitos:

### build-apk.bat
```batch
@echo off
echo Construyendo APK de Escritor IA...
npx cap sync android
npx cap build android
echo APK construido en: android/app/build/outputs/apk/debug/
pause
```

### build-release.bat
```batch
@echo off
echo Construyendo APK de Release...
cd android
.\gradlew assembleRelease
echo APK de release construido en: app/build/outputs/apk/release/
pause
```

## 📞 Soporte

Si encuentras problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Reinicia la terminal después de instalar Java/Android Studio
3. Consulta la [documentación oficial de Capacitor](https://capacitorjs.com/docs/android)

## 🎉 ¡Listo!

Tu proyecto ya está preparado para generar APKs. Solo necesitas instalar los requisitos y ejecutar los comandos de construcción.