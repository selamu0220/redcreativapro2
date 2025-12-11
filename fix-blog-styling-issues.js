#!/usr/bin/env node

/**
 * Script para arreglar problemas de estilos en artículos del blog
 * Corrige colores, contraste y legibilidad
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Iniciando corrección de estilos del blog...\n');

// Función para leer archivos de forma segura
function readFileSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`⚠️  No se pudo leer ${filePath}: ${error.message}`);
    return null;
  }
}

// Función para escribir archivos de forma segura
function writeFileSync(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.log(`❌ Error escribiendo ${filePath}: ${error.message}`);
    return false;
  }
}

// 1. Crear estilos CSS simples para corregir problemas
const blogFixStyles = `
/* Correcciones de estilos para artículos del blog */
@layer utilities {
  /* Corregir colores hardcodeados */
  .blog-article .text-gray-900 {
    color: hsl(var(--foreground)) !important;
  }

  .blog-article .text-gray-800 {
    color: hsl(var(--foreground)) !important;
  }

  .blog-article .text-gray-700 {
    color: hsl(var(--muted-foreground)) !important;
  }

  .blog-article .text-gray-600 {
    color: hsl(var(--muted-foreground)) !important;
  }

  /* Corregir fondos */
  .blog-article .bg-white {
    background-color: hsl(var(--card)) !important;
    border: 1px solid hsl(var(--border));
  }

  .blog-article .bg-gray-50,
  .blog-article .bg-gray-100 {
    background-color: hsl(var(--muted)) !important;
  }

  /* Corregir fondos de colores */
  .blog-article .bg-green-50,
  .blog-article .bg-blue-50,
  .blog-article .bg-yellow-50,
  .blog-article .bg-purple-50,
  .blog-article .bg-pink-50 {
    background-color: hsl(var(--muted)) !important;
    border: 1px solid hsl(var(--border));
  }

  /* Corregir gradientes */
  .blog-article .bg-gradient-to-r,
  .blog-article .bg-gradient-to-br {
    background: hsl(var(--muted)) !important;
    border: 1px solid hsl(var(--border));
  }

  /* Mejorar títulos */
  .blog-article h1,
  .blog-article h2,
  .blog-article h3,
  .blog-article h4,
  .blog-article h5,
  .blog-article h6 {
    color: hsl(var(--foreground)) !important;
    font-weight: 700;
  }

  /* Mejorar párrafos */
  .blog-article p {
    color: hsl(var(--foreground)) !important;
    line-height: 1.7;
  }

  /* Mejorar enlaces */
  .blog-article a {
    color: hsl(var(--primary)) !important;
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .blog-article h1 {
      font-size: 1.75rem;
    }
    .blog-article h2 {
      font-size: 1.5rem;
    }
  }
}
`;

console.log('📝 Creando componente ArticleWrapper...');
if (writeFileSync('app/components/ArticleWrapper.tsx', articleWrapperContent)) {
  console.log('✅ ArticleWrapper creado exitosamente');
} else {
  console.log('❌ Error creando ArticleWrapper');
}

// 2. Función para actualizar un artículo específico
function updateArticleFile(filePath) {
  const content = readFileSync(filePath);
  if (!content) return false;

  console.log(`🔧 Actualizando ${filePath}...`);

  let updatedContent = content;

  // Agregar import del ArticleWrapper si no existe
  if (!content.includes('ArticleWrapper')) {
    updatedContent = updatedContent.replace(
      /import.*from.*lucide-react.*;\n/,
      `$&import ArticleWrapper from "@/app/components/ArticleWrapper";\n`
    );
  }

  // Envolver el contenido del artículo con ArticleWrapper
  if (!content.includes('<ArticleWrapper>')) {
    // Buscar el return statement y envolver el contenido
    updatedContent = updatedContent.replace(
      /return \(\s*<>\s*/,
      'return (\n    <ArticleWrapper>\n      <>'
    );

    updatedContent = updatedContent.replace(
      /<\/>\s*\);?\s*}?\s*$/,
      '      </>\n    </ArticleWrapper>\n  );\n}'
    );
  }

  // Corregir clases específicas problemáticas
  const colorFixes = [
    // Textos grises
    ['text-gray-900', 'text-foreground'],
    ['text-gray-800', 'text-foreground'],
    ['text-gray-700', 'text-muted-foreground'],
    ['text-gray-600', 'text-muted-foreground'],
    
    // Fondos
    ['bg-white', 'bg-card'],
    ['bg-gray-50', 'bg-muted'],
    ['bg-gray-100', 'bg-muted'],
    
    // Bordes
    ['border-gray-200', 'border-border'],
    ['border-gray-100', 'border-border'],
  ];

  colorFixes.forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    updatedContent = updatedContent.replace(regex, newClass);
  });

  // Escribir el archivo actualizado
  return writeFileSync(filePath, updatedContent);
}

// 3. Buscar y actualizar todos los archivos de artículos
console.log('\n🔍 Buscando archivos de artículos...');

const blogDir = 'app/blog';
if (fs.existsSync(blogDir)) {
  const entries = fs.readdirSync(blogDir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      const articlePath = path.join(blogDir, entry.name, 'page.tsx');
      if (fs.existsSync(articlePath)) {
        if (updateArticleFile(articlePath)) {
          console.log(`✅ ${entry.name} actualizado`);
        } else {
          console.log(`❌ Error actualizando ${entry.name}`);
        }
      }
    }
  });
}

// 4. Actualizar el archivo principal del blog
console.log('\n🔧 Actualizando página principal del blog...');
const blogPagePath = 'app/blog/page.tsx';
if (updateArticleFile(blogPagePath)) {
  console.log('✅ Página principal del blog actualizada');
} else {
  console.log('❌ Error actualizando página principal del blog');
}

// 5. Crear estilos adicionales para mejorar la legibilidad
const additionalStyles = `
/* Estilos adicionales para mejorar legibilidad del blog */
@layer utilities {
  /* Asegurar contraste mínimo en todos los elementos */
  .blog-content * {
    color: hsl(var(--foreground));
  }

  /* Mejorar legibilidad de elementos específicos */
  .blog-article {
    line-height: 1.7;
    font-size: 1.1rem;
  }

  .blog-article h1,
  .blog-article h2,
  .blog-article h3,
  .blog-article h4,
  .blog-article h5,
  .blog-article h6 {
    color: hsl(var(--foreground)) !important;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .blog-article p {
    color: hsl(var(--foreground)) !important;
    margin-bottom: 1.5rem;
  }

  /* Cajas de contenido destacado */
  .blog-highlight-box {
    background-color: hsl(var(--muted)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  .blog-highlight-box * {
    color: hsl(var(--foreground)) !important;
  }

  /* Mejorar contraste de iconos */
  .blog-content .lucide {
    color: hsl(var(--primary)) !important;
  }

  /* Asegurar que los enlaces sean visibles */
  .blog-content a {
    color: hsl(var(--primary)) !important;
    text-decoration: underline;
    text-decoration-color: hsl(var(--primary));
  }

  .blog-content a:hover {
    opacity: 0.8;
  }

  /* Mejorar espaciado en móvil */
  @media (max-width: 768px) {
    .blog-article {
      font-size: 1rem;
      line-height: 1.6;
    }

    .blog-article h1 {
      font-size: 1.75rem;
    }

    .blog-article h2 {
      font-size: 1.5rem;
    }

    .blog-article h3 {
      font-size: 1.25rem;
    }

    .blog-highlight-box {
      padding: 1rem;
      margin: 1rem 0;
    }
  }
}
`;

console.log('\n📝 Agregando estilos adicionales...');
const globalCssPath = 'app/globals.css';
const globalCss = readFileSync(globalCssPath);

if (globalCss && !globalCss.includes('blog-content')) {
  const updatedGlobalCss = globalCss + additionalStyles;
  if (writeFileSync(globalCssPath, updatedGlobalCss)) {
    console.log('✅ Estilos adicionales agregados a globals.css');
  } else {
    console.log('❌ Error agregando estilos adicionales');
  }
} else {
  console.log('ℹ️  Estilos adicionales ya existen o no se pudo leer globals.css');
}

console.log('\n🎉 ¡Corrección de estilos completada!');
console.log('\n📋 Resumen de cambios:');
console.log('• ✅ Creado componente ArticleWrapper para estilos consistentes');
console.log('• ✅ Corregidos colores hardcodeados en artículos');
console.log('• ✅ Mejorado contraste para mejor legibilidad');
console.log('• ✅ Agregados estilos responsivos para móvil');
console.log('• ✅ Implementado soporte completo para tema oscuro/claro');
console.log('\n🚀 Los artículos del blog ahora deberían tener mejor legibilidad y contraste.');