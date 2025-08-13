const fs = require('fs');
const { Pool } = require('pg');
const { customAlphabet } = require('nanoid');

// Helper para generar slugs únicos y cortos
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

// Función para obtener conexión a la base de datos por usuario
function getDbConnection(userId) {
  const dbName = `redcreativa_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Para desarrollo local, usar configuración simple
  return new Pool({
    host: 'localhost',
    port: 5432,
    database: dbName,
    user: 'postgres',
    password: 'postgres', // Cambiar por la contraseña correcta
    ssl: false
  });
}

async function migrateEmailPages() {
  try {
    console.log('🚀 Iniciando migración de páginas de email...');
    
    // Leer páginas del archivo JSON
    const jsonData = JSON.parse(fs.readFileSync('./data/email-pages.json', 'utf8'));
    console.log(`📄 Encontradas ${jsonData.length} páginas en el archivo JSON`);
    
    // Agrupar páginas por usuario
    const pagesByUser = {};
    jsonData.forEach(page => {
      if (!pagesByUser[page.userEmail]) {
        pagesByUser[page.userEmail] = [];
      }
      pagesByUser[page.userEmail].push(page);
    });
    
    console.log(`👥 Usuarios encontrados: ${Object.keys(pagesByUser).join(', ')}`);
    
    // Migrar páginas para cada usuario
    for (const [userEmail, pages] of Object.entries(pagesByUser)) {
      console.log(`\n🔄 Migrando ${pages.length} páginas para ${userEmail}...`);
      
      const userId = userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const db = getDbConnection(userId);
      
      try {
        // Verificar si la tabla existe
        const tableCheck = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'email_pages'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log(`❌ La tabla email_pages no existe para ${userEmail}. Ejecuta primero el aprovisionamiento.`);
          continue;
        }
        
        // Verificar páginas existentes
        const existingPages = await db.query('SELECT slug FROM email_pages');
        const existingSlugs = new Set(existingPages.rows.map(row => row.slug));
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const page of pages) {
          // Generar slug único
          let slug = nanoid();
          while (existingSlugs.has(slug)) {
            slug = nanoid();
          }
          
          try {
            // Insertar página en la base de datos
            await db.query(`
              INSERT INTO email_pages (
                slug, title, description, button_text, success_message, 
                is_active, collect_name, custom_fields, qualification_form,
                "createdAt", "updatedAt"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
              slug,
              page.title,
              page.description,
              page.buttonText || 'Suscribirse',
              page.successMessage || '¡Gracias por suscribirte!',
              page.isActive !== false,
              page.collectName !== false,
              JSON.stringify(page.customFields || []),
              JSON.stringify(page.qualificationForm || {}),
              page.createdAt || new Date().toISOString(),
              page.updatedAt || new Date().toISOString()
            ]);
            
            migratedCount++;
            console.log(`  ✅ Migrada: "${page.title}" (slug: ${slug})`);
            
          } catch (error) {
            console.log(`  ❌ Error migrando "${page.title}": ${error.message}`);
            skippedCount++;
          }
        }
        
        console.log(`📊 Resultado para ${userEmail}: ${migratedCount} migradas, ${skippedCount} omitidas`);
        
      } catch (error) {
        console.error(`❌ Error conectando a la base de datos de ${userEmail}:`, error.message);
      } finally {
        await db.end();
      }
    }
    
    console.log('\n🎉 Migración completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Verifica que las páginas se migraron correctamente');
    console.log('2. Haz backup del archivo email-pages.json');
    console.log('3. Elimina o renombra el archivo JSON para evitar confusiones');
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateEmailPages().catch(console.error);
}

module.exports = { migrateEmailPages };