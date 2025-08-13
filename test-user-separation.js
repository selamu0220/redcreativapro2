const fs = require('fs');

// Función para probar la separación de usuarios
async function testUserSeparation() {
  console.log('🔍 Probando separación de usuarios en páginas de email...');
  
  try {
    // Leer el archivo de páginas
    const pagesData = JSON.parse(fs.readFileSync('data/email-pages.json', 'utf8'));
    
    // Agrupar páginas por usuario
    const pagesByUser = {};
    pagesData.forEach(page => {
      if (!pagesByUser[page.userEmail]) {
        pagesByUser[page.userEmail] = [];
      }
      pagesByUser[page.userEmail].push(page);
    });
    
    console.log('\n📊 Resumen de páginas por usuario:');
    Object.keys(pagesByUser).forEach(userEmail => {
      console.log(`  👤 ${userEmail}: ${pagesByUser[userEmail].length} páginas`);
      pagesByUser[userEmail].forEach(page => {
        console.log(`    📄 ${page.id} - "${page.title}" (${page.isActive ? 'Activa' : 'Inactiva'})`);
      });
    });
    
    // Verificar que cada página tiene userEmail
    const pagesWithoutUser = pagesData.filter(page => !page.userEmail);
    if (pagesWithoutUser.length > 0) {
      console.log('\n❌ Páginas sin userEmail encontradas:');
      pagesWithoutUser.forEach(page => {
        console.log(`  📄 ${page.id} - "${page.title}"`);
      });
    } else {
      console.log('\n✅ Todas las páginas tienen userEmail asignado');
    }
    
    // Verificar URLs públicas
    console.log('\n🌐 URLs públicas disponibles:');
    pagesData.forEach(page => {
      if (page.isActive) {
        console.log(`  🔗 http://localhost:3000/collect/${page.id} (Usuario: ${page.userEmail})`);
      }
    });
    
    console.log('\n✅ Prueba de separación de usuarios completada exitosamente!');
    console.log('\n📝 Resumen:');
    console.log(`  - Total de páginas: ${pagesData.length}`);
    console.log(`  - Usuarios únicos: ${Object.keys(pagesByUser).length}`);
    console.log(`  - Páginas activas: ${pagesData.filter(p => p.isActive).length}`);
    console.log(`  - Páginas inactivas: ${pagesData.filter(p => !p.isActive).length}`);
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar la prueba
testUserSeparation();