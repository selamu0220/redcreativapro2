#!/usr/bin/env node

const fs = require('fs');

console.log('🎨 Arreglando el fondo azul en modo oscuro...\n');

// Leer el archivo globals.css
const globalsPath = 'app/globals.css';
let content = fs.readFileSync(globalsPath, 'utf8');

// Asegurarse de que el dark mode tenga el fondo correcto
const darkModeSection = `  .dark {
    /* Dark theme - Pure Neutral Palette (Black & White Professional) */
    --background: 0 0% 3.9%;  /* Deep Black */
    --foreground: 0 0% 98%;   /* Pure White */
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;`;

if (!content.includes('--background: 0 0% 3.9%;')) {
  console.log('❌ El fondo oscuro no está configurado correctamente');
  console.log('✅ Actualizando configuración...');
  
  // Reemplazar la sección dark
  content = content.replace(
    /\.dark\s*{[\s\S]*?--background:.*?;/,
    darkModeSection
  );
  
  fs.writeFileSync(globalsPath, content, 'utf8');
  console.log('✅ Archivo globals.css actualizado');
} else {
  console.log('✅ El fondo oscuro ya está configurado correctamente');
}

// Agregar estilos adicionales para forzar el fondo correcto
const additionalStyles = `
/* Force correct dark mode background */
@layer base {
  html.dark,
  html.dark body,
  .dark {
    background-color: hsl(0 0% 3.9%) !important;
  }
  
  html:not(.dark),
  html:not(.dark) body {
    background-color: hsl(0 0% 100%) !important;
  }
}`;

if (!content.includes('Force correct dark mode background')) {
  console.log('✅ Agregando estilos de forzado de fondo...');
  content += additionalStyles;
  fs.writeFileSync(globalsPath, content, 'utf8');
}

console.log('\n✨ ¡Listo! El fondo azul debería estar arreglado.');
console.log('\n📋 Siguiente paso:');
console.log('   1. Recarga la página con Ctrl+Shift+R (hard refresh)');
console.log('   2. Si persiste, limpia el caché del navegador');
console.log('   3. Verifica que el modo oscuro esté activado correctamente\n');
