const fs = require('fs');
const path = require('path');

// Leer el archivo blog-data.ts
const filePath = path.join(__dirname, 'lib', 'blog-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Eliminar todas las líneas que contienen views: o likes:
content = content.replace(/^\s*views:\s*\d+,?\s*$/gm, '');
content = content.replace(/^\s*likes:\s*\d+,?\s*$/gm, '');

// Limpiar líneas vacías múltiples
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Escribir el archivo actualizado
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Eliminadas todas las referencias de views y likes del archivo blog-data.ts');