const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'app/blog/crear-ebooks-con-ia/page.tsx',
  'app/blog/crear-cursos-online-con-ia/page.tsx',
  'app/blog/traducir-textos-con-ia/page.tsx',
  'app/blog/seo-con-inteligencia-artificial/page.tsx',
  'app/blog/resumir-textos-con-ia/page.tsx',
  'app/blog/plantillas-de-prompts-para-ia/page.tsx',
  'app/blog/parafrasear-con-inteligencia-artificial/page.tsx',
  'app/blog/ia-para-redes-sociales/page.tsx',
  'app/blog/ia-para-marketing-de-contenidos/page.tsx',
  'app/blog/generador-de-contenido-con-ia/page.tsx',
  'app/blog/corrector-de-textos-inteligente/page.tsx',
  'app/blog/automatizar-correos-electronicos-ia/page.tsx',
  'app/blog/copywriting-con-inteligencia-artificial/page.tsx',
  'app/blog/como-escribir-con-inteligencia-artificial/page.tsx',
  'app/blog/chatgpt-para-escritores/page.tsx',
  'app/blog/automatizar-email-marketing-con-ia/page.tsx'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Head import
    content = content.replace(/import Head from 'next\/head'\n?/g, '');
    content = content.replace(/import.*Head.*from.*'next\/head'.*\n?/g, '');
    
    // Remove Head component usage
    content = content.replace(/<Head>[\s\S]*?<\/Head>/g, '');
    
    // Fix any remaining Head references in JSX
    content = content.replace(/<Head>/g, '<>');
    content = content.replace(/<\/Head>/g, '</>');
    
    // Clean up any duplicate imports
    const lines = content.split('\n');
    const cleanedLines = [];
    const seenImports = new Set();
    
    for (const line of lines) {
      if (line.trim().startsWith('import')) {
        if (!seenImports.has(line.trim())) {
          seenImports.add(line.trim());
          cleanedLines.push(line);
        }
      } else {
        cleanedLines.push(line);
      }
    }
    
    content = cleanedLines.join('\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing Head import issues in blog pages...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ All files processed!');