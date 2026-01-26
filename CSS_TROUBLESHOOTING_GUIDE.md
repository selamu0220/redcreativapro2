# Guía de Resolución de Problemas: CSS No Renderiza en Producción

## 🔍 Problema
La aplicación carga el contenido HTML pero no aplica ningún estilo (CSS), mostrando solo texto sin formato en el navegador.

## 🎯 Causa Raíz
La configuración `output: 'standalone'` en `next.config.js`. 

Aunque esta opción es útil para optimizar deployments en contenedores (Docker), puede interferir con la forma en que Vercel sirve los archivos estáticos generados por Tailwind CSS, causando que el navegador reciba errores 404 al intentar cargar los archivos `.css`.

## ✅ Solución Aplicada

1. **Modificar `next.config.js`**:
   Se eliminó o comentó la línea `output: 'standalone'`.
   
   ```javascript
   // next.config.js
   const nextConfig = {
     reactStrictMode: true,
     // output: 'standalone', // ELIMINADO PARA CORREGIR RENDERIZADO DE CSS
     // ...
   }
   ```

2. **Limpiar Cache de Build**:
   Es fundamental limpiar la cache de build en Vercel para asegurar que los artefactos del modo standalone no persistan.

3. **Redesplegar**:
   Realizar un nuevo despliegue completo sin la opción standalone.

## 🛠️ Cómo Prevenir Recurrencia

- **Evitar standalone en Vercel**: A menos que sea estrictamente necesario para un despliegue personalizado fuera de Vercel, mantén esta opción desactivada.
- **Verificar Build Scripts**: Asegúrate de que tu `package.json` no tenga flags que fuercen modos de salida incompatibles con tu proveedor de hosting.
- **Validar Archivos Estáticos**: Si los estilos desaparecen tras un cambio de configuración, verifica en la pestaña "Network" de las herramientas de desarrollador si los archivos `.css` están devolviendo status 404.

## 📝 Pasos de Verificación Rápidos
1. Abrir el sitio en producción.
2. Presionar `F12` (DevTools).
3. Ir a la pestaña **Network**.
4. Filtrar por **CSS**.
5. Recargar la página (`F5`).
6. El archivo principal de estilos (ej. `ec58eb63c2fb32e3.css`) debe cargar con status **200 OK**.
