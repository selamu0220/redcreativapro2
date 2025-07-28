# Docker Deployment Guide

## Archivos de Docker creados

- `Dockerfile`: Configuración multi-stage para optimizar la imagen de producción
- `.dockerignore`: Excluye archivos innecesarios del contexto de build
- `render.yaml`: Configuración para deployment en Render
- `next.config.js`: Actualizado con `output: 'standalone'` para Docker

## Build y ejecución local

### Construir la imagen
```bash
docker build -t escritor-ia .
```

### Ejecutar el contenedor
```bash
docker run -p 3000:3000 escritor-ia
```

### Con variables de entorno
```bash
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=tu_api_key \
  -e GMAIL_USER=tu_email@gmail.com \
  -e GMAIL_APP_PASSWORD=tu_app_password \
  escritor-ia
```

## Deployment en Render

### Opción 1: Usando render.yaml (Recomendado)

1. Sube tu código a GitHub
2. Conecta tu repositorio en Render
3. Render detectará automáticamente el archivo `render.yaml`
4. Configura las variables de entorno en el dashboard de Render:
   - `GEMINI_API_KEY`
   - `GMAIL_USER` (opcional)
   - `GMAIL_APP_PASSWORD` (opcional)

### Opción 2: Configuración manual

1. Crea un nuevo Web Service en Render
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Region**: Oregon (o tu preferencia)
   - **Plan**: Free (o el que prefieras)

### Variables de entorno requeridas

En el dashboard de Render, agrega estas variables:

```
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=tu_api_key_aqui
```

### Variables opcionales (para funcionalidad de email)

```
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicacion
```

## Características del Dockerfile

- **Multi-stage build**: Optimiza el tamaño de la imagen final
- **Node.js 18 Alpine**: Imagen base ligera y segura
- **Standalone output**: Incluye todas las dependencias necesarias
- **Usuario no-root**: Ejecuta la aplicación con usuario `nextjs` por seguridad
- **Optimización de capas**: Minimiza rebuilds innecesarios

## Troubleshooting

### Error de permisos
Si encuentras errores de permisos, verifica que el usuario `nextjs` tenga acceso a los archivos necesarios.

### Variables de entorno
Asegúrate de que todas las variables de entorno estén configuradas correctamente en Render.

### Build failures
Si el build falla, verifica que:
- El archivo `package.json` esté presente
- Todas las dependencias estén listadas correctamente
- No hay errores de TypeScript en el código

## Monitoreo

Render proporciona:
- Logs en tiempo real
- Métricas de rendimiento
- Health checks automáticos
- SSL/TLS automático

## Escalabilidad

Para mayor tráfico, considera:
- Upgrade a un plan pagado en Render
- Configurar auto-scaling
- Implementar CDN para assets estáticos