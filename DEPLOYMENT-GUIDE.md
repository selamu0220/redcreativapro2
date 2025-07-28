# 🚀 Guía de Deployment - Escritor IA

## Prerrequisitos

### 1. Docker Desktop
- **Windows**: Descargar desde [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- **Asegúrate de que Docker Desktop esté ejecutándose** antes de hacer el build
- Verifica la instalación: `docker --version`

### 2. Cuenta en Render
- Crear cuenta gratuita en [Render.com](https://render.com)
- Conectar tu repositorio de GitHub

## 🐳 Build Local con Docker

### Paso 1: Iniciar Docker Desktop
```bash
# En Windows, busca "Docker Desktop" en el menú inicio y ejecútalo
# Espera a que aparezca el ícono en la bandeja del sistema
```

### Paso 2: Build de la imagen
```bash
# Desde la raíz del proyecto
docker build -t escritor-ia:latest .
```

### Paso 3: Ejecutar localmente (opcional)
```bash
# Ejecutar en puerto 3000
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=tu_api_key_aqui \
  --name escritor-ia-test \
  --rm \
  escritor-ia:latest
```

## 🌐 Deployment en Render

### Opción 1: Usando render.yaml (Recomendado)

1. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin main
   ```

2. **Conectar en Render**:
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente el `render.yaml`

3. **Configurar Variables de Entorno**:
   ```
   GEMINI_API_KEY=tu_api_key_de_gemini
   GMAIL_USER=tu_email@gmail.com (opcional)
   GMAIL_APP_PASSWORD=tu_app_password (opcional)
   NODE_ENV=production
   PORT=3000
   ```

### Opción 2: Configuración Manual

1. **Crear Web Service**:
   - Runtime: Docker
   - Build Command: `docker build -t escritor-ia .`
   - Start Command: `docker run -p $PORT:3000 escritor-ia`

2. **Configurar Variables**:
   - Mismas variables que la Opción 1

## 🔧 Variables de Entorno Requeridas

### Obligatorias
- `GEMINI_API_KEY`: Tu API key de Google Gemini
- `NODE_ENV`: `production`
- `PORT`: `3000` (Render lo asigna automáticamente)

### Opcionales (para funcionalidad de email)
- `GMAIL_USER`: Tu email de Gmail
- `GMAIL_APP_PASSWORD`: Contraseña de aplicación de Gmail

## 📝 Notas Importantes

### Para Gmail SMTP:
1. Habilitar verificación en 2 pasos en tu cuenta de Gmail
2. Generar una contraseña de aplicación:
   - Ve a Configuración de Google → Seguridad
   - Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro"
   - Copia la contraseña generada

### Archivos Creados:
- `Dockerfile`: Configuración de la imagen Docker
- `docker-compose.yml`: Para desarrollo local (opcional)
- `render.yaml`: Configuración de deployment en Render
- `.dockerignore`: Archivos excluidos del build
- `.env.example`: Plantilla de variables de entorno

## 🚨 Troubleshooting

### Error: "Docker daemon not running"
- **Solución**: Iniciar Docker Desktop y esperar a que esté completamente cargado

### Error: "Port already in use"
- **Solución**: Cambiar el puerto local: `docker run -p 3001:3000 ...`

### Error de build en Render
- **Verificar**: Que todas las variables de entorno estén configuradas
- **Verificar**: Que el repositorio esté actualizado en GitHub

### Problemas de memoria en Render (plan gratuito)
- El plan gratuito tiene 512MB RAM
- La aplicación está optimizada para este límite
- Si hay problemas, considera el plan Starter ($7/mes)

## 📊 Monitoreo

### Logs en Render:
- Ve a tu servicio en Render Dashboard
- Click en "Logs" para ver logs en tiempo real
- Útil para debugging de problemas de deployment

### Métricas:
- Render proporciona métricas básicas de CPU y memoria
- Disponible en la pestaña "Metrics"

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Hacer cambios en el código
2. Commit y push a GitHub
3. Render automáticamente detectará los cambios y redesplegará

## 💡 Tips de Optimización

- **Caché de Docker**: Los layers se cachean para builds más rápidos
- **Multi-stage build**: Reduce el tamaño final de la imagen
- **Standalone output**: Next.js optimizado para contenedores
- **Alpine Linux**: Imagen base ligera para mejor rendimiento

---

¿Necesitas ayuda? Revisa los logs en Render o contacta al equipo de desarrollo.