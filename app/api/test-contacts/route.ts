import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Función para obtener el ID de usuario limpio
function getUserId(email: string): string {
  return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// KV helper functions
const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;

async function kvGet<T>(key: string, fallback: () => T): Promise<T> {
  try {
    if (!hasKV) return fallback();
    const value = await kv.get<T>(key);
    return (value as T) ?? fallback();
  } catch {
    return fallback();
  }
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    if (!hasKV) return;
    await kv.set(key, value);
  } catch {
    // ignore
  }
}

// Función para obtener contactos de un usuario específico
async function getUserContacts(userEmail: string): Promise<any[]> {
  const userId = getUserId(userEmail);
  return kvGet<any[]>(`contacts:${userId}`, () => []);
}

// Función para guardar contactos de un usuario específico
async function saveUserContacts(userEmail: string, contacts: any[]): Promise<void> {
  const userId = getUserId(userEmail);
  await kvSet(`contacts:${userId}`, contacts);
  console.log(`✅ Guardado en KV: contacts:${userId}`);
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
    console.log(`🔑 KV Key: contacts:${getUserId(userEmail)}`);
    
    return NextResponse.json({
      success: true,
      message: 'Contacto guardado exitosamente',
      contact: newContact,
      storage: {
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
    
    return NextResponse.json({
      userEmail,
      userId,
      contactsCount: contacts.length,
      contacts,
      storage: {
        kvKey: `contacts:${userId}`
      }
    });
    
  } catch (error: any) {
    console.error('Error obteniendo contactos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
