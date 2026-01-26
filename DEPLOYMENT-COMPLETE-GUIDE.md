# 🚀 Guía Completa de Deployment - Escritor IA

Esta guía te ayudará a desplegar tu aplicación Escritor IA en diferentes plataformas.

## 📋 Opciones de Deployment Disponibles

### 1. 🌐 Vercel (Recomendado)
**Mejor para:** Aplicaciones Next.js, deployment rápido, escalabilidad automática

### 2. 🎨 Render
**Mejor para:** Aplicaciones con Docker, control de infraestructura

### 3. 🐳 Docker Local/Servidor
**Mejor para:** Desarrollo local, servidores propios

---

## 🌐 Deployment en Vercel

### Prerrequisitos
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub/GitLab/Bitbucket
- Vercel CLI (opcional)

### Método 1: Dashboard de Vercel (Recomendado)
1. Ve a [vercel.com](https://vercel.com) y haz login
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Configura las variables de entorno:
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   GMAIL_USER=tu_email@gmail.com (opcional)
   GMAIL_APP_PASSWORD=tu_password_aqui (opcional)
   FIREBASE_API_KEY=tu_firebase_key (si usas Firebase)
   FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   FIREBASE_PROJECT_ID=tu_proyecto_id
   FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   FIREBASE_APP_ID=tu_app_id
   NODE_ENV=production
   ```
6. Haz clic en "Deploy"

### Método 2: Vercel CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Configuración Automática
El proyecto ya incluye `vercel.json` con la configuración optimizada:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

---

## 🎨 Deployment en Render

### Prerrequisitos
- Cuenta en [Render](https://render.com)
- Repositorio en GitHub/GitLab

### Pasos
1. **Sube tu código a GitHub**
   ```bash
   git add .
   git commit -m "Preparar para deployment"
   git push origin main
   ```

2. **Conecta en Render**
   - Ve a [render.com](https://render.com)
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio

3. **Configuración Automática**
   - Render detectará el archivo `render.yaml`
   - Configuración incluida:
     - Tipo: Web Service
     - Environment: Docker
     - Plan: Free
     - Puerto: 3000

4. **Variables de Entorno**
   Configura en el dashboard de Render:
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   GMAIL_USER=tu_email@gmail.com
   GMAIL_APP_PASSWORD=tu_password_aqui
   FIREBASE_API_KEY=tu_firebase_key
   FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   FIREBASE_PROJECT_ID=tu_proyecto_id
   FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   FIREBASE_APP_ID=tu_app_id
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Haz clic en "Create Web Service"
   - Render construirá y desplegará automáticamente

---

## 🐳 Deployment con Docker

### Prerrequisitos
- Docker Desktop instalado
- Conocimientos básicos de Docker

### Build Local
```bash
# Construir imagen
docker build -t escritor-ia:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=tu_api_key \
  --name escritor-ia \
  escritor-ia:latest
```

### Docker Compose (Recomendado)
Crea un archivo `docker-compose.yml`:
```yaml
version: '3.8'
services:
  escritor-ia:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GMAIL_USER=${GMAIL_USER}
      - GMAIL_APP_PASSWORD=${GMAIL_APP_PASSWORD}
      - FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
      - FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
      - FIREBASE_APP_ID=${FIREBASE_APP_ID}
    restart: unless-stopped
```

Ejecutar:
```bash
docker-compose up -d
```

---

## 🔧 Variables de Entorno Requeridas

### Obligatorias
- `GEMINI_API_KEY`: API key de Google Gemini
- `NODE_ENV`: Debe ser "production" para deployment

### Opcionales
- `GMAIL_USER`: Email para envío de correos
- `GMAIL_APP_PASSWORD`: Password de aplicación de Gmail
- `PORT`: Puerto del servidor (default: 3000)

### Firebase (si usas autenticación)
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

---

## 🛠️ Scripts de Deployment

### PowerShell (Windows)
```powershell
.\deploy-production.ps1
```

### Bash (Linux/Mac)
```bash
./deploy.sh
```

### Manual
```bash
# Build del proyecto
npm run build

# Iniciar en producción
npm start
```

---

## 🔍 Verificación Post-Deployment

### Checklist
- [ ] La aplicación carga correctamente
- [ ] Las páginas de captura funcionan (`/collect/[pageId]`)
- [ ] La API responde correctamente
- [ ] Las variables de entorno están configuradas
- [ ] Los logs no muestran errores críticos

### URLs de Prueba
- Página principal: `https://tu-dominio.com`
- API de salud: `https://tu-dominio.com/api/test-connection`
- Página de captura: `https://tu-dominio.com/collect/page_test_user2_123`

---

## 🚨 Solución de Problemas

### Error: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Port already in use"
```bash
# Cambiar puerto
export PORT=3001
npm start
```

### Error de variables de entorno
- Verifica que todas las variables estén configuradas
- Revisa que no haya espacios extra
- Confirma que las API keys sean válidas

### Error de build
```bash
# Verificar sintaxis
npm run lint

# Build con más información
npm run build -- --debug
```

---

## 📚 Recursos Adicionales

- [Documentación de Next.js Deployment](https://nextjs.org/docs/deployment)
- [Guía de Vercel](https://vercel.com/docs)
- [Documentación de Render](https://render.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs de la aplicación
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de la plataforma específica
4. Revisa los archivos de configuración incluidos en el proyecto

¡Tu aplicación Escritor IA está lista para el mundo! 🚀