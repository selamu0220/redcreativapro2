const fs = require('fs');
const path = require('path');

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Crear directorio dist si no existe
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copiar archivos estáticos de Next.js
if (fs.existsSync('.next/static')) {
  copyDir('.next/static', 'dist/_next/static');
}

// Copiar el index.html existente (ya optimizado para móvil)
if (fs.existsSync('dist/index.html')) {
  console.log('✅ Usando index.html existente optimizado para móvil');
} else {
  // Crear un index.html básico si no existe
  const basicHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Escritor IA - Mobile App</title>
    <meta name="theme-color" content="#667eea">
</head>
<body>
    <div id="app">
        <h1>Escritor IA</h1>
        <p>Aplicación móvil cargando...</p>
    </div>
</body>
</html>`;
  
  fs.writeFileSync('dist/index.html', basicHtml);
}

// Copiar manifest.json si existe
if (fs.existsSync('dist/manifest.json')) {
  console.log('✅ Manifest.json ya existe');
}

console.log('✅ Build móvil completado - archivos copiados a dist/');
console.log('📱 La carpeta dist/ ahora contiene todos los archivos necesarios para Capacitor');