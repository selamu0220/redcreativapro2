import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

// Función para obtener el ID de usuario limpio
function getUserId(email: string): string {
  return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// Función para obtener la ruta del archivo de contactos del usuario
function getUserContactsPath(userEmail: string): string {
  const userId = getUserId(userEmail);
  return path.join(process.cwd(), 'data', `contacts-${userId}.json`);
}

// Función para obtener contactos de un usuario específico
async function getUserContacts(userEmail: string): Promise<any[]> {
  const userId = getUserId(userEmail);
  
  try {
    // Intentar obtener de KV primero
    if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      const kvContacts = await kv.get(`contacts:${userId}`);
      if (kvContacts) {
        return Array.isArray(kvContacts) ? kvContacts : [];
      }
    }
  } catch (error) {
    console.log('KV no disponible, usando archivo local');
  }
  
  // Fallback a archivo local
  const filePath = getUserContactsPath(userEmail);
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error leyendo archivo de contactos:', error);
  }
  
  return [];
}

// Función para guardar contactos de un usuario específico
async function saveUserContacts(userEmail: string, contacts: any[]): Promise<void> {
  const userId = getUserId(userEmail);
  
  // Guardar en KV si está disponible
  try {
    if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      await kv.set(`contacts:${userId}`, contacts);
      console.log(`✅ Guardado en KV: contacts:${userId}`);
    }
  } catch (error) {
    console.log('❌ KV no disponible para guardar');
  }
  
  // Guardar en archivo local como respaldo
  const filePath = getUserContactsPath(userEmail);
  try {
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
    console.log(`✅ Guardado en archivo: ${filePath}`);
  } catch (error) {
    console.error('❌ Error guardando archivo de contactos:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n=== PRUEBA DE CONTACTOS SEPARADOS ===');
    const body = await request.json();
    const { userEmail, email, name } = body;
    
    if (!userEmail || !email) {
      return NextResponse.json({ error: 'userEmail y email son requeridos' }, { status: 400 });
    }
    
    console.log(`👤 Usuario: ${userEmail}`);
    console.log(`📧 Email: ${email}`);
    console.log(`👋 Nombre: ${name || 'Sin nombre'}`);
    
    // Obtener contactos existentes del usuario
    const existingContacts = await getUserContacts(userEmail);
    console.log(`📋 Contactos existentes: ${existingContacts.length}`);
    
    // Verificar si el contacto ya existe
    const existingContact = existingContacts.find(c => c.email === email);
    
    if (existingContact) {
      console.log('⚠️ Contacto ya existe');
      return NextResponse.json({
        message: 'Contacto ya existe',
        contact: existingContact,
        storage: {
          userFile: getUserContactsPath(userEmail),
          kvKey: `contacts:${getUserId(userEmail)}`,
          totalContacts: existingContacts.length
        }
      });
    }
    
    // Crear nuevo contacto
    const newContact = {
      id: Date.now().toString(),
      email,
      name: name || '',
      userEmail,
      createdAt: new Date().toISOString(),
      source: 'test-endpoint'
    };
    
    // Agregar a la lista
    existingContacts.push(newContact);
    
    // Guardar
    await saveUserContacts(userEmail, existingContacts);
    
    console.log('✅ Contacto guardado exitosamente');
    console.log(`📁 Archivo: ${getUserContactsPath(userEmail)}`);
    console.log(`🔑 KV Key: contacts:${getUserId(userEmail)}`);
    
    return NextResponse.json({
      success: true,
      message: 'Contacto guardado exitosamente',
      contact: newContact,
      storage: {
        userFile: getUserContactsPath(userEmail),
        kvKey: `contacts:${getUserId(userEmail)}`,
        totalContacts: existingContacts.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error en test-contacts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail es requerido' }, { status: 400 });
    }
    
    const contacts = await getUserContacts(userEmail);
    const userId = getUserId(userEmail);
    const filePath = getUserContactsPath(userEmail);
    
    return NextResponse.json({
      userEmail,
      userId,
      contactsCount: contacts.length,
      contacts,
      storage: {
        kvKey: `contacts:${userId}`,
        filePath: filePath,
        fileExists: fs.existsSync(filePath)
      }
    });
    
  } catch (error: any) {
    console.error('Error obteniendo contactos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}