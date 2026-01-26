const fs = require('fs');
const path = require('path');

// Leer el archivo blog-data.ts para obtener los IDs existentes
const blogDataPath = path.join(__dirname, 'lib', 'blog-data.ts');
const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');

// Extraer todos los IDs del array blogPosts
const existingIds = [];
const idMatches = blogDataContent.match(/^\s+id: '([^']+)',/gm);
if (idMatches) {
  idMatches.forEach(match => {
    const id = match.match(/id: '([^']+)'/)[1];
    // Solo incluir IDs que no sean de autores o categorías
    if (!['selamu', 'ia-educacion', 'productividad', 'tecnologia', 'creatividad', 'negocios'].includes(id) &&
        !id.includes('investigacion-academica') && !id.includes('colaboracion-equipos') && 
        !id.includes('metodologias-ia') && !id.includes('automatizacion') && 
        !id.includes('herramientas-ia') && !id.includes('flujos-trabajo') &&
        !id.includes('desarrollo-software') && !id.includes('integraciones') &&
        !id.includes('apis-ia') && !id.includes('contenido-creativo') &&
        !id.includes('diseno-ia') && !id.includes('marketing-digital') &&
        !id.includes('estrategia-empresarial') && !id.includes('analisis-datos') &&
        !id.includes('transformacion-digital')) {
      existingIds.push(id);
    }
  });
}

console.log('IDs existentes en blogPosts:', existingIds.length);
console.log(existingIds);

// Leer todos los directorios del blog
const blogDir = path.join(__dirname, 'app', 'blog');
const allDirectories = fs.readdirSync(blogDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => name !== '[id]' && name !== 'sitemap.xml'); // Excluir directorios especiales

console.log('\nTodos los directorios de artículos:', allDirectories.length);
console.log(allDirectories);

// Encontrar los artículos faltantes
const missingArticles = allDirectories.filter(dir => !existingIds.includes(dir));

console.log('\nArtículos faltantes:', missingArticles.length);
console.log(missingArticles);

// Guardar la lista de artículos faltantes
fs.writeFileSync('missing-articles.txt', missingArticles.join('\n'));
console.log('\nLista guardada en missing-articles.txt');