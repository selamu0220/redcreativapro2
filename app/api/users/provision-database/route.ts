import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

// API para provisionar automáticamente una base de datos para un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId y userEmail son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una configuración de base de datos para este usuario
    const existingConfig = await kv.get(`db:user:${userId}`);
    if (existingConfig) {
      return NextResponse.json(
        { message: 'Base de datos ya existe para este usuario', exists: true },
        { status: 200 }
      );
    }

    const adminConnectionString = process.env.POSTGRES_ADMIN_URL;
    if (!adminConnectionString) {
      console.error('POSTGRES_ADMIN_URL no está configurada');
      return NextResponse.json(
        { error: 'Configuración de base de datos no disponible' },
        { status: 500 }
      );
    }

    const adminPool = new Pool({ connectionString: adminConnectionString });
    const adminClient = await adminPool.connect();

    const dbName = `tenant_${userId.replace(/-/g, '_')}`;
    const dbUser = `user_${userId.replace(/-/g, '_')}`;
    const dbPassword = `pw_${randomUUID()}`;

    try {
      console.log(`Provisionando base de datos para usuario: ${userEmail} (${userId})`);

      // 1. Crear usuario de base de datos
      await adminClient.query(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}'`);

      // 2. Crear base de datos
      await adminClient.query(`CREATE DATABASE ${dbName} OWNER ${dbUser}`);

      // 3. Conectar a la nueva base de datos y crear tablas
      const { host, port } = adminPool.options;
      const tenantConnectionString = `postgres://${dbUser}:${dbPassword}@${host}:${port}/${dbName}`;
      
      const tenantPool = new Pool({ connectionString: tenantConnectionString });
      const tenantClient = await tenantPool.connect();

      // Crear tabla de contactos
      await tenantClient.query(`
        CREATE TABLE contacts (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          source VARCHAR(100),
          tags TEXT[],
          "isSubscribed" BOOLEAN DEFAULT true,
          "additionalContext" JSONB,
          "unsubscribeToken" VARCHAR(50),
          "qualificationData" JSONB,
          "lastQualificationUpdate" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla de documentos
      await tenantClient.query(`
        CREATE TABLE documents (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          content TEXT,
          "folderId" INTEGER,
          type VARCHAR(50) DEFAULT 'other',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla de carpetas
      await tenantClient.query(`
        CREATE TABLE folders (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          "parentFolderId" INTEGER,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla de plantillas
      await tenantClient.query(`
        CREATE TABLE templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          subject VARCHAR(500),
          content TEXT,
          category VARCHAR(100),
          tags TEXT[],
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla de páginas de email
      await tenantClient.query(`
        CREATE TABLE email_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          "buttonText" VARCHAR(100),
          "successMessage" TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "collectName" BOOLEAN DEFAULT false,
          "customFields" JSONB,
          "qualificationForm" JSONB,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla de historial de emails
      await tenantClient.query(`
        CREATE TABLE email_history (
          id SERIAL PRIMARY KEY,
          "recipientEmail" VARCHAR(255) NOT NULL,
          "recipientName" VARCHAR(255),
          subject VARCHAR(500),
          content TEXT,
          status VARCHAR(50) DEFAULT 'sent',
          "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "templateId" INTEGER,
          "campaignId" VARCHAR(100),
          metadata JSONB
        );
      `);

      // Crear función para actualizar updatedAt automáticamente
      await tenantClient.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Crear triggers para updatedAt
      const tables = ['contacts', 'documents', 'folders', 'templates', 'email_pages'];
      for (const table of tables) {
        await tenantClient.query(`
          CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `);
      }

      tenantClient.release();
      await tenantPool.end();

      // 4. Guardar la cadena de conexión en Vercel KV
      await kv.set(`db:user:${userId}`, tenantConnectionString);

      console.log(`✅ Base de datos provisionada exitosamente para ${userEmail}`);

      return NextResponse.json({
        message: 'Base de datos provisionada exitosamente',
        success: true,
        database: dbName
      });

    } catch (dbError) {
      console.error('Error provisionando base de datos:', dbError);
      
      // Intentar limpiar en caso de error
      try {
        await adminClient.query(`DROP DATABASE IF EXISTS ${dbName}`);
        await adminClient.query(`DROP USER IF EXISTS ${dbUser}`);
      } catch (cleanupError) {
        console.error('Error en limpieza:', cleanupError);
      }
      
      throw dbError;
    } finally {
      adminClient.release();
      await adminPool.end();
    }

  } catch (error) {
    console.error('Error en provision-database:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}