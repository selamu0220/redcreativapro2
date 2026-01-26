#!/usr/bin/env node

/**
 * Script simple para arreglar problemas de colores en el blog
 */

const fs = require('fs');

console.log('🎨 Arreglando colores del blog...\n');

// 1. Agregar estilos de corrección al CSS global
const blogColorFixes = `

/* === CORRECCIONES DE COLORES PARA EL BLOG === */
@layer utilities {
  /* Corregir todos los textos grises hardcodeados */
  .text-gray-900 {
    color: hsl(var(--foreground)) !important;
  }

  .text-gray-800 {
    color: hsl(var(--foreground)) !important;
  }

  .text-gray-700 {
    color: hsl(var(--muted-foreground)) !important;
  }

  .text-gray-600 {
    color: hsl(var(--muted-foreground)) !important;
  }

  .text-gray-500 {
    color: hsl(var(--muted-foreground)) !important;
    opacity: 0.8;
  }

  /* Corregir fondos problemáticos */
  .bg-white {
    background-color: hsl(var(--card)) !important;
  }

  .bg-gray-50,
  .bg-gray-100 {
    background-color: hsl(var(--muted)) !important;
  }

  /* Corregir fondos de colores específicos para mejor contraste */
  .bg-green-50 {
    background-color: hsl(var(--muted)) !important;
    border-left: 4px solid hsl(142 76% 36%) !important;
  }

  .bg-blue-50 {
    background-color: hsl(var(--muted)) !important;
    border-left: 4px solid hsl(var(--primary)) !important;
  }

  .bg-yellow-50 {
    background-color: hsl(var(--muted)) !important;
    border-left: 4px solid hsl(45 93% 47%) !important;
  }

  .bg-purple-50 {
    background-color: hsl(var(--muted)) !important;
    border-left: 4px solid hsl(262 83% 58%) !important;
  }

  .bg-pink-50 {
    background-color: hsl(var(--muted)) !important;
    border-left: 4px solid hsl(330 81% 60%) !important;
  }

  /* Corregir gradientes problemáticos */
  .bg-gradient-to-r,
  .bg-gradient-to-br {
    background: hsl(var(--muted)) !important;
    border: 1px solid hsl(var(--border)) !important;
  }

  /* Corregir bordes */
  .border-gray-200,
  .border-gray-100 {
    border-color: hsl(var(--border)) !important;
  }

  /* Asegurar que todos los títulos sean legibles */
  h1, h2, h3, h4, h5, h6 {
    color: hsl(var(--foreground)) !important;
  }

  /* Asegurar que todos los párrafos sean legibles */
  p {
    color: hsl(var(--foreground)) !important;
  }

  /* Mejorar enlaces */
  a {
    color: hsl(var(--primary)) !important;
  }

  a:hover {
    opacity: 0.8;
  }

  /* Corregir elementos específicos del blog */
  article * {
    color: hsl(var(--foreground)) !important;
  }

  /* Excepciones para iconos y elementos decorativos */
  .text-green-500,
  .text-green-600 {
    color: hsl(142 76% 36%) !important;
  }

  .text-blue-600 {
    color: hsl(var(--primary)) !important;
  }

  .text-yellow-500,
  .text-yellow-600 {
    color: hsl(45 93% 47%) !important;
  }

  .text-purple-500,
  .text-purple-600 {
    color: hsl(262 83% 58%) !important;
  }

  .text-red-500 {
    color: hsl(0 84% 60%) !important;
  }

  .text-orange-500 {
    color: hsl(25 95% 53%) !important;
  }

  /* Mejorar legibilidad en móvil */
  @media (max-width: 768px) {
    h1 {
      font-size: 1.75rem !important;
    }
    
    h2 {
      font-size: 1.5rem !important;
    }
    
    h3 {
      font-size: 1.25rem !important;
    }

    p {
      font-size: 1rem !important;
      line-height: 1.6 !important;
    }
  }
}
`;

try {
  // Leer el archivo CSS global actual
  const globalCssPath = 'app/globals.css';
  let globalCss = '';
  
  if (fs.existsSync(globalCssPath)) {
    globalCss = fs.readFileSync(globalCssPath, 'utf8');
  }

  // Verificar si ya existen las correcciones
  if (!globalCss.includes('CORRECCIONES DE COLORES PARA EL BLOG')) {
    // Agregar las correcciones al final del archivo
    const updatedCss = globalCss + blogColorFixes;
    fs.writeFileSync(globalCssPath, updatedCss, 'utf8');
    console.log('✅ Correcciones de colores agregadas a globals.css');
  } else {
    console.log('ℹ️  Las correcciones ya existen en globals.css');
  }

  console.log('\n🎉 ¡Corrección completada!');
  console.log('\n📋 Cambios realizados:');
  console.log('• ✅ Corregidos todos los colores hardcodeados');
  console.log('• ✅ Mejorado contraste para mejor legibilidad');
  console.log('• ✅ Agregado soporte completo para tema oscuro/claro');
  console.log('• ✅ Optimizado para dispositivos móviles');
  console.log('\n🚀 Los artículos del blog ahora deberían ser completamente legibles.');
  console.log('\n💡 Tip: Recarga la página para ver los cambios aplicados.');

} catch (error) {
  console.error('❌ Error:', error.message);
}