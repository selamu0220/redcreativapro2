const { Pool } = require('pg');
const fs = require('fs');

// Leer usuarios desde el archivo JSON local
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

async function checkDataSeparation() {
  console.log('Verificando separación de datos entre usuarios...');
  
  try {
    // Conectar a la base de datos principal
    const db = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    });

    console.log('\n=== VERIFICANDO CONTACTOS ===');
    
    // Verificar contactos por usuario
    for (const user of users) {
      const result = await db.query(
        'SELECT COUNT(*) as count, user_email FROM contacts WHERE user_email = $1 GROUP BY user_email',
        [user.email]
      );
      
      if (result.rows.length > 0) {
        console.log(`Usuario ${user.email}: ${result.rows[0].count} contactos`);
      } else {
        console.log(`Usuario ${user.email}: 0 contactos`);
      }
    }

    // Verificar si hay contactos sin user_email (datos compartidos)
    const orphanContacts = await db.query(
      'SELECT COUNT(*) as count FROM contacts WHERE user_email IS NULL OR user_email = \'\' '
    );
    
    if (orphanContacts.rows[0].count > 0) {
      console.log(`\n⚠️  PROBLEMA: ${orphanContacts.rows[0].count} contactos sin user_email asignado`);
    }

    // Verificar contactos totales
    const totalContacts = await db.query('SELECT COUNT(*) as count FROM contacts');
    console.log(`\nTotal de contactos en la base de datos: ${totalContacts.rows[0].count}`);

    // Verificar si todos los contactos tienen user_email
    const contactsWithUser = await db.query(
      'SELECT COUNT(*) as count FROM contacts WHERE user_email IS NOT NULL AND user_email != \'\' '
    );
    
    console.log(`Contactos con user_email asignado: ${contactsWithUser.rows[0].count}`);
    
    if (totalContacts.rows[0].count === contactsWithUser.rows[0].count) {
      console.log('✅ Todos los contactos tienen user_email asignado');
    } else {
      console.log('❌ Hay contactos sin user_email - DATOS COMPARTIDOS DETECTADOS');
    }

    // Verificar otras tablas
    console.log('\n=== VERIFICANDO OTRAS TABLAS ===');
    
    const tables = ['documents', 'folders', 'templates', 'email_pages', 'email_history'];
    
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${result.rows[0].count} registros`);
        
        const withUser = await db.query(
          `SELECT COUNT(*) as count FROM ${table} WHERE user_email IS NOT NULL AND user_email != ''`
        );
        console.log(`  - Con user_email: ${withUser.rows[0].count}`);
        
        if (result.rows[0].count !== withUser.rows[0].count) {
          console.log(`  ❌ ${table} tiene registros sin user_email`);
        }
      } catch (error) {
        console.log(`  - ${table}: tabla no existe o error: ${error.message}`);
      }
    }

    await db.end();
    
  } catch (error) {
    console.error('Error verificando separación de datos:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkDataSeparation().catch(console.error);
}

module.exports = { checkDataSeparation };