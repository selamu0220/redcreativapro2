import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// KV helper functions
async function kvGet(key: string) {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error('KV get error:', error);
    return null;
  }
}

async function kvSet(key: string, value: any) {
  try {
    await kv.set(key, value);
  } catch (error) {
    console.error('KV set error:', error);
    throw error;
  }
}

// Función para obtener el ID de usuario limpio
function getUserId(email: string): string {
  return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// KV key generator for user contacts
function getContactsKey(userEmail: string): string {
  const userId = getUserId(userEmail);
  return `contacts:${userId}`;
}

// Función para obtener contactos de un usuario específico
async function getUserContacts(userEmail: string): Promise<any[]> {
  const contactsKey = getContactsKey(userEmail);
  
  try {
    const kvContacts = await kvGet(contactsKey);
    if (kvContacts) {
      return Array.isArray(kvContacts) ? kvContacts : [];
    }
  } catch (error) {
    console.error('Error obteniendo contactos de KV:', error);
  }
  
  return [];
}

// Función para guardar contactos de un usuario específico
async function saveUserContacts(userEmail: string, contacts: any[]): Promise<void> {
  const contactsKey = getContactsKey(userEmail);
  
  try {
    await kvSet(contactsKey, contacts);
  } catch (error) {
    console.error('Error guardando contactos en KV:', error);
    throw error;
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
    const contactsKey = getContactsKey(userEmail);
    
    return NextResponse.json({
      userEmail,
      userId,
      contactsCount: contacts.length,
      contacts,
      storage: {
        kvKey: contactsKey,
        storageType: 'kv'
      }
    });
    
  } catch (error: any) {
    console.error('Error obteniendo contactos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, contact } = body;
    
    if (!userEmail || !contact) {
      return NextResponse.json({ 
        error: 'userEmail y contact son requeridos' 
      }, { status: 400 });
    }
    
    // Obtener contactos existentes
    const existingContacts = await getUserContacts(userEmail);
    
    // Verificar si el contacto ya existe
    const existingIndex = existingContacts.findIndex(
      c => c.email === contact.email
    );
    
    if (existingIndex >= 0) {
      // Actualizar contacto existente
      existingContacts[existingIndex] = {
        ...existingContacts[existingIndex],
        ...contact,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Agregar nuevo contacto
      const newContact = {
        ...contact,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        userEmail
      };
      existingContacts.push(newContact);
    }
    
    // Guardar contactos actualizados
    await saveUserContacts(userEmail, existingContacts);
    
    const userId = getUserId(userEmail);
    const contactsKey = getContactsKey(userEmail);
    
    return NextResponse.json({
      success: true,
      message: existingIndex >= 0 ? 'Contacto actualizado' : 'Contacto agregado',
      contact: existingIndex >= 0 ? existingContacts[existingIndex] : existingContacts[existingContacts.length - 1],
      storage: {
        kvKey: contactsKey,
        storageType: 'kv',
        totalContacts: existingContacts.length
      }
    });
    
  } catch (error: any) {
    console.error('Error guardando contacto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const contactEmail = searchParams.get('contactEmail');
    
    if (!userEmail || !contactEmail) {
      return NextResponse.json({ 
        error: 'userEmail y contactEmail son requeridos' 
      }, { status: 400 });
    }
    
    // Obtener contactos existentes
    const existingContacts = await getUserContacts(userEmail);
    
    // Filtrar el contacto a eliminar
    const filteredContacts = existingContacts.filter(
      c => c.email !== contactEmail
    );
    
    if (filteredContacts.length === existingContacts.length) {
      return NextResponse.json({ 
        error: 'Contacto no encontrado' 
      }, { status: 404 });
    }
    
    // Guardar contactos actualizados
    await saveUserContacts(userEmail, filteredContacts);
    
    const userId = getUserId(userEmail);
    const contactsKey = getContactsKey(userEmail);
    
    return NextResponse.json({
      success: true,
      message: 'Contacto eliminado',
      storage: {
        kvKey: contactsKey,
        storageType: 'kv',
        totalContacts: filteredContacts.length
      }
    });
    
  } catch (error: any) {
    console.error('Error eliminando contacto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
