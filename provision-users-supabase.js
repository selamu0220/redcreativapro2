import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Leer usuarios desde el archivo JSON local
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

async function provisionUserDatabase(userId, userEmail) {
  try {
    // Verificar si ya tiene configuración en Supabase
    const { data: existingConfig, error: checkError } = await supabase
      .from('user_database_configs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingConfig && !checkError) {
      console.log(`✓ Usuario ${userEmail} ya tiene base de datos configurada`);
      return { status: 'already_exists' };
    }

    // Crear configuración de base de datos
    const dbName = `user_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dbUser = `user_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dbPassword = Math.random().toString(36).substring(2, 15);
    
    // Usar la base de datos principal para crear el usuario y la base de datos
    const mainDb = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    });

    // Crear usuario y base de datos
    await mainDb.query(`CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`);
    await mainDb.query(`CREATE DATABASE "${dbName}" OWNER "${dbUser}"`);
    await mainDb.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`);

    // Conectar a la nueva base de datos para crear tablas
    const userDbConnectionString = process.env.DATABASE_URL.replace(
      /\/[^/]*$/, 
      `/${dbName}`
    ).replace(
      /:([^:@]*@)/, 
      `:${dbPassword}@`
    ).replace(
      /@([^@/]*):/, 
      `@${dbUser}:`
    );

    const userDb = new Pool({
      connectionString: userDbConnectionString,
      max: 1,
    });

    // Crear tablas
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        user_email VARCHAR(255) NOT NULL,
        is_subscribed BOOLEAN DEFAULT true,
        source VARCHAR(100),
        tags TEXT[],
        unsubscribe_token VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        qualification_data JSONB
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        folder_id INTEGER,
        user_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT,
        user_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        user_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_history (
        id SERIAL PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        content TEXT,
        user_email VARCHAR(255) NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'sent'
      );
    `;

    await userDb.query(createTablesSQL);

    // Guardar la configuración en Supabase
    const { error: insertError } = await supabase
      .from('user_database_configs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        connection_string: userDbConnectionString,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Error guardando configuración en Supabase: ${insertError.message}`);
    }

    await userDb.end();
    await mainDb.end();

    console.log(`✓ Base de datos provisionada para ${userEmail}`);
    return { status: 'success' };

  } catch (error) {
    console.error(`✗ Error provisionando base de datos para ${userEmail}:`, error.message);
    return { status: 'error', error: error.message };
  }
}

async function provisionAllUsers() {
  console.log('Iniciando provisionamiento de bases de datos para usuarios existentes...');
  
  // Crear tabla de configuraciones si no existe
  const { error: tableError } = await supabase.rpc('create_user_database_configs_table');
  if (tableError && !tableError.message.includes('already exists')) {
    console.log('Creando tabla user_database_configs manualmente...');
    // Si la función RPC no existe, intentamos crear la tabla directamente
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_database_configs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        connection_string TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await supabase.rpc('exec_sql', { sql: createTableSQL });
    } catch (err) {
      console.log('Nota: No se pudo crear la tabla automáticamente. Asegúrate de que existe user_database_configs en Supabase.');
    }
  }
  
  const results = [];
  
  for (const user of users) {
    const userId = user.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const result = await provisionUserDatabase(userId, user.email);
    results.push({
      email: user.email,
      ...result
    });
  }
  
  console.log('\n=== RESUMEN ===');
  console.log(`Total usuarios: ${users.length}`);
  console.log(`Exitosos: ${results.filter(r => r.status === 'success').length}`);
  console.log(`Ya existían: ${results.filter(r => r.status === 'already_exists').length}`);
  console.log(`Errores: ${results.filter(r => r.status === 'error').length}`);
  
  if (results.filter(r => r.status === 'error').length > 0) {
    console.log('\nErrores:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`- ${r.email}: ${r.error}`);
    });
  }
}

// Ejecutar directamente
provisionAllUsers().catch(console.error);

export { provisionAllUsers, provisionUserDatabase };