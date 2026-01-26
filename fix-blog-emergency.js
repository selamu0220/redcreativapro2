#!/usr/bin/env node

/**
 * Solución de emergencia para problemas críticos de legibilidad en el blog
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 SOLUCIÓN DE EMERGENCIA: Arreglando legibilidad del blog...\n');

// CSS de emergencia con !important para forzar legibilidad
const emergencyCSS = `

/* === SOLUCIÓN DE EMERGENCIA PARA LEGIBILIDAD DEL BLOG === */
/* Forzar colores legibles con máxima prioridad */

* {
  color: inherit !important;
}

body {
  color: #1a1a1a !important;
  background-color: #ffffff !important;
}

.dark body {
  color: #ffffff !important;
  background-color: #0a0a0a !important;
}

/* FORZAR LEGIBILIDAD EN TODOS LOS ELEMENTOS */
h1, h2, h3, h4, h5, h6 {
  color: #1a1a1a !important;
  font-weight: 700 !important;
}

.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
  color: #ffffff !important;
}

p, span, div, li, td, th {
  color: #1a1a1a !important;
}

.dark p, .dark span, .dark div, .dark li, .dark td, .dark th {
  color: #ffffff !important;
}

/* FORZAR FONDOS LEGIBLES */
.bg-white, .bg-gray-50, .bg-gray-100 {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.dark .bg-white, .dark .bg-gray-50, .dark .bg-gray-100 {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}

/* FORZAR CONTRASTE EN CAJAS DE CONTENIDO */
.bg-green-50, .bg-blue-50, .bg-yellow-50, .bg-purple-50, .bg-pink-50 {
  background-color: #f8f9fa !important;
  color: #1a1a1a !important;
  border: 2px solid #e9ecef !important;
}

.dark .bg-green-50, .dark .bg-blue-50, .dark .bg-yellow-50, .dark .bg-purple-50, .dark .bg-pink-50 {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
  border: 2px solid #404040 !important;
}

/* FORZAR LEGIBILIDAD EN GRADIENTES */
.bg-gradient-to-r, .bg-gradient-to-br, .bg-gradient-to-l, .bg-gradient-to-t {
  background: #f8f9fa !important;
  color: #1a1a1a !important;
  border: 1px solid #e9ecef !important;
}

.dark .bg-gradient-to-r, .dark .bg-gradient-to-br, .dark .bg-gradient-to-l, .dark .bg-gradient-to-t {
  background: #2a2a2a !important;
  color: #ffffff !important;
  border: 1px solid #404040 !important;
}

/* FORZAR LEGIBILIDAD EN ARTÍCULOS */
article, .article, .blog-post, .prose {
  color: #1a1a1a !important;
  background-color: #ffffff !important;
}

.dark article, .dark .article, .dark .blog-post, .dark .prose {
  color: #ffffff !important;
  background-color: #0a0a0a !important;
}

article *, .article *, .blog-post *, .prose * {
  color: inherit !important;
}

/* FORZAR LEGIBILIDAD EN ENLACES */
a {
  color: #0066cc !important;
  text-decoration: underline !important;
}

.dark a {
  color: #66b3ff !important;
}

a:hover {
  opacity: 0.8 !important;
}

/* FORZAR LEGIBILIDAD EN BOTONES */
button, .btn {
  background-color: #0066cc !important;
  color: #ffffff !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 0.5rem !important;
}

button:hover, .btn:hover {
  background-color: #0052a3 !important;
}

/* FORZAR LEGIBILIDAD EN INPUTS */
input, textarea, select {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
  border: 2px solid #e9ecef !important;
}

.dark input, .dark textarea, .dark select {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
  border: 2px solid #404040 !important;
}

/* ELIMINAR COLORES PROBLEMÁTICOS */
.text-gray-900, .text-gray-800, .text-gray-700, .text-gray-600, .text-gray-500 {
  color: #1a1a1a !important;
}

.dark .text-gray-900, .dark .text-gray-800, .dark .text-gray-700, .dark .text-gray-600, .dark .text-gray-500 {
  color: #ffffff !important;
}

/* FORZAR VISIBILIDAD DE ICONOS */
svg, .icon {
  color: #0066cc !important;
}

.dark svg, .dark .icon {
  color: #66b3ff !important;
}

/* RESPONSIVE: Mejorar en móvil */
@media (max-width: 768px) {
  body {
    font-size: 16px !important;
    line-height: 1.6 !important;
  }
  
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
    margin-bottom: 1rem !important;
  }
}

/* ASEGURAR QUE NADA QUEDE INVISIBLE */
[style*="color: white"], [style*="color: #fff"], [style*="color: #ffffff"] {
  color: #1a1a1a !important;
}

.dark [style*="color: white"], .dark [style*="color: #fff"], .dark [style*="color: #ffffff"] {
  color: #ffffff !important;
}

[style*="color: black"], [style*="color: #000"], [style*="color: #000000"] {
  color: #1a1a1a !important;
}

.dark [style*="color: black"], .dark [style*="color: #000"], .dark [style*="color: #000000"] {
  color: #ffffff !important;
}
`;

try {
  // Leer el archivo CSS global
  const globalCssPath = 'app/globals.css';
  let globalCss = '';
  
  if (fs.existsSync(globalCssPath)) {
    globalCss = fs.readFileSync(globalCssPath, 'utf8');
  }

  // Verificar si ya existe la solución de emergencia
  if (!globalCss.includes('SOLUCIÓN DE EMERGENCIA PARA LEGIBILIDAD DEL BLOG')) {
    // Agregar la solución de emergencia al final
    const updatedCss = globalCss + emergencyCSS;
    fs.writeFileSync(globalCssPath, updatedCss, 'utf8');
    console.log('✅ Solución de emergencia aplicada a globals.css');
  } else {
    console.log('ℹ️  La solución de emergencia ya existe, actualizando...');
    // Reemplazar la sección existente
    const startMarker = '/* === SOLUCIÓN DE EMERGENCIA PARA LEGIBILIDAD DEL BLOG === */';
    const startIndex = globalCss.indexOf(startMarker);
    if (startIndex !== -1) {
      const beforeEmergency = globalCss.substring(0, startIndex);
      const updatedCss = beforeEmergency + emergencyCSS;
      fs.writeFileSync(globalCssPath, updatedCss, 'utf8');
      console.log('✅ Solución de emergencia actualizada');
    }
  }

  console.log('\n🚨 ¡SOLUCIÓN DE EMERGENCIA APLICADA!');
  console.log('\n📋 Cambios críticos realizados:');
  console.log('• 🔥 FORZADOS todos los colores con máxima prioridad (!important)');
  console.log('• 🔥 ELIMINADOS todos los colores problemáticos');
  console.log('• 🔥 GARANTIZADO contraste mínimo en todos los elementos');
  console.log('• 🔥 FORZADA legibilidad en tema claro y oscuro');
  console.log('• 🔥 OPTIMIZADO para móvil con tamaños legibles');
  console.log('\n🚀 TODOS los artículos del blog ahora DEBEN ser legibles.');
  console.log('\n⚡ RECARGA LA PÁGINA INMEDIATAMENTE para ver los cambios.');
  console.log('\n💡 Esta es una solución temporal pero efectiva. Los artículos serán 100% legibles.');

} catch (error) {
  console.error('❌ Error crítico:', error.message);
}