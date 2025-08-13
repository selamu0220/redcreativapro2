// scripts/provision-tenant.ts
import { kv } from '@vercel/kv';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

// Este script necesita ejecutarse en un entorno Node.js
// Ejemplo de uso: ts-node scripts/provision-tenant.ts <userId>

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Error: Se requiere un ID de usuario.');
    console.log('Uso: ts-node scripts/provision-tenant.ts <userId>');
    process.exit(1);
  }

  const adminConnectionString = process.env.POSTGRES_ADMIN_URL;
  if (!adminConnectionString) {
    console.error('Error: La variable de entorno POSTGRES_ADMIN_URL no está configurada.');
    process.exit(1);
  }

  const adminPool = new Pool({ connectionString: adminConnectionString });
  const adminClient = await adminPool.connect();

  const dbName = `tenant_${userId.replace(/-/g, '_')}`; // Limpiar userId para el nombre de la BD
  const dbUser = `user_${userId.replace(/-/g, '_')}`;
  const dbPassword = `pw_${randomUUID()}`; // Generar una contraseña segura y aleatoria

  try {
    console.log(`Aprovisionando nuevo inquilino para el usuario: ${userId}`);

    // 1. Crear un nuevo usuario (rol) para la base de datos del inquilino
    console.log(`Creando usuario: ${dbUser}...`);
    await adminClient.query(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}'`);

    // 2. Crear la nueva base de datos, propiedad del nuevo usuario
    console.log(`Creando base de datos: ${dbName}...`);
    await adminClient.query(`CREATE DATABASE ${dbName} OWNER ${dbUser}`);

    console.log('Base de datos y usuario creados exitosamente.');

    // 3. Conectarse a la *nueva* base de datos para crear tablas
    const { host, port } = adminPool.options;
    const tenantConnectionString = `postgres://${dbUser}:${dbPassword}@${host}:${port}/${dbName}`;
    console.log(`Conectando a la nueva base de datos "${dbName}" para configurar el esquema...`);
    const tenantPool = new Pool({ connectionString: tenantConnectionString });
    const tenantClient = await tenantPool.connect();

    // 4. Crear la tabla 'contacts'
    console.log("Creando tabla 'contacts'...");
    await tenantClient.query(`
      CREATE TABLE contacts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        source VARCHAR(100),
        tags TEXT[],
        "isSubscribed" BOOLEAN DEFAULT true,
        "additionalContext" JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'contacts' creada.");

    // Crear un disparador para actualizar automáticamente la marca de tiempo 'updatedAt'
    await tenantClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_contacts_updated_at
      BEFORE UPDATE ON contacts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("Disparador para 'updatedAt' creado.");

    // 4b. Crear las tablas 'folders' y 'documents'
    console.log("Creando tabla 'folders'...");
    await tenantClient.query(`
      CREATE TABLE folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "parentFolderId" INTEGER REFERENCES folders(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'folders' creada.");

    console.log("Creando tabla 'documents'...");
    await tenantClient.query(`
      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT,
        "folderId" INTEGER REFERENCES folders(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'documents' creada.");

    // Añadir disparadores para las nuevas tablas
    await tenantClient.query(`
      CREATE TRIGGER update_folders_updated_at
      BEFORE UPDATE ON folders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_documents_updated_at
      BEFORE UPDATE ON documents
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("Disparadores para 'folders' y 'documents' creados.");

    // 4c. Crear tabla 'templates'
    console.log("Creando tabla 'templates'...");
    await tenantClient.query(`
      CREATE TABLE templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        body TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'templates' creada.");

    // Añadir disparador para la nueva tabla
    await tenantClient.query(`
      CREATE TRIGGER update_templates_updated_at
      BEFORE UPDATE ON templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("Disparador para 'templates' creado.");

    // 4d. Crear tabla 'email_pages'
    console.log("Creando tabla 'email_pages'...");
    await tenantClient.query(`
      CREATE TABLE email_pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        button_text VARCHAR(255) DEFAULT 'Suscribirse',
        success_message TEXT DEFAULT '¡Gracias por suscribirte!',
        is_active BOOLEAN DEFAULT true,
        collect_name BOOLEAN DEFAULT true,
        custom_fields JSONB DEFAULT '[]',
        qualification_form JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla 'email_pages' creada.");

    // Añadir disparador para la nueva tabla
    await tenantClient.query(`
      CREATE TRIGGER update_email_pages_updated_at
      BEFORE UPDATE ON email_pages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("Disparador para 'email_pages' creado.");

    // 4e. Crear tabla 'email_history'
    console.log("Creando tabla 'email_history'...");
    await tenantClient.query(`
      CREATE TABLE email_history (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        metadata JSONB,
        clicked_links TEXT[],
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        opened_at TIMESTAMP WITH TIME ZONE,
        clicked_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log("Tabla 'email_history' creada.");

    tenantClient.release();
    await tenantPool.end();

    // 5. Almacenar la nueva cadena de conexión en Vercel KV
    const kvKey = `db:user:${userId}`;
    console.log(`Almacenando cadena de conexión en Vercel KV con la clave: ${kvKey}`);
    await kv.set(kvKey, tenantConnectionString);

    console.log('✅ Aprovisionamiento de inquilino completado!');

  } catch (error) {
    console.error('❌ Falló el aprovisionamiento del inquilino:', error);
    // Opcional: Añadir lógica de limpieza aquí para eliminar la BD/usuario creado en caso de fallo
  } finally {
    adminClient.release();
    await adminPool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
