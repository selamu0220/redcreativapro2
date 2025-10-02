import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Helper functions for KV operations
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

// Función para obtener la clave KV de contactos del usuario
function getUserContactsKey(userEmail: string): string {
  const userId = getUserId(userEmail);
  return `contacts:${userId}`;
}

// Función para obtener contactos de un usuario específico
async function getUserContacts(userEmail: string): Promise<any[]> {
  const contactsKey = getUserContactsKey(userEmail);
  
  const kvContacts = await kvGet(contactsKey);
  if (kvContacts && Array.isArray(kvContacts)) {
    return kvContacts;
  }
  
  return [];
}

// Función para guardar contactos de un usuario específico
async function saveUserContacts(userEmail: string, contacts: any[]): Promise<void> {
  const contactsKey = getUserContactsKey(userEmail);
  await kvSet(contactsKey, contacts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userEmail, email, name } = body;
    
    if (action === 'add') {
      // Agregar contacto
      if (!userEmail || !email) {
        return NextResponse.json({ error: 'userEmail y email son requeridos' }, { status: 400 });
      }
      
      const existingContacts = await getUserContacts(userEmail);
      const existingContact = existingContacts.find(c => c.email === email);
      
      if (existingContact) {
        return NextResponse.json({
          message: 'Contacto ya existe',
          contact: existingContact,
          userStorage: {
            contactsKey: getUserContactsKey(userEmail),
            storageType: 'kv',
            totalContacts: existingContacts.length
          }
        });
      }
      
      const newContact = {
        id: Date.now().toString(),
        email,
        name: name || '',
        userEmail,
        createdAt: new Date().toISOString(),
        source: 'demo-separation'
      };
      
      existingContacts.push(newContact);
      await saveUserContacts(userEmail, existingContacts);
      
      return NextResponse.json({
        success: true,
        message: 'Contacto agregado exitosamente',
        contact: newContact,
        userStorage: {
          contactsKey: getUserContactsKey(userEmail),
          storageType: 'kv',
          totalContacts: existingContacts.length
        }
      });
    }
    
    if (action === 'demo') {
      // Crear demo completo
      const users = [
        { email: 'usuario1@test.com', name: 'Usuario 1' },
        { email: 'usuario2@test.com', name: 'Usuario 2' },
        { email: 'usuario3@test.com', name: 'Usuario 3' }
      ];
      
      const results = [];
      
      for (const user of users) {
        const contacts = [];
        
        // Crear 3 contactos para cada usuario
        for (let i = 1; i <= 3; i++) {
          const emailDomain = user.email?.split('@')[1] || 'example.com';
          const contact = {
            id: `${Date.now()}-${i}`,
            email: `contacto${i}@${emailDomain}`,
            name: `Contacto ${i} de ${user.name}`,
            userEmail: user.email,
            createdAt: new Date().toISOString(),
            source: 'demo-separation'
          };
          contacts.push(contact);
        }
        
        await saveUserContacts(user.email, contacts);
        
        results.push({
          user: user.email,
          contactsCreated: contacts.length,
          storage: {
            contactsKey: getUserContactsKey(user.email),
            storageType: 'kv'
          },
          contacts: contacts
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Demo creado exitosamente',
        results: results,
        summary: {
          totalUsers: users.length,
          totalContacts: results.reduce((sum, r) => sum + r.contactsCreated, 0),
          separateKvKeys: results.map(r => r.storage.contactsKey),
          storageType: 'kv'
        }
      });
    }
    
    return NextResponse.json({ error: 'Acción no válida. Use action: "add" o "demo"' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (userEmail) {
      // Obtener contactos de un usuario específico
      const contacts = await getUserContacts(userEmail);
      const userId = getUserId(userEmail);
      const contactsKey = getUserContactsKey(userEmail);
      
      return NextResponse.json({
        userEmail,
        userId,
        contactsCount: contacts.length,
        contacts,
        storage: {
          contactsKey: contactsKey,
          storageType: 'kv'
        }
      });
    } else {
      // Mostrar resumen de todos los usuarios desde KV
      // Nota: KV no permite listar todas las claves, por lo que retornamos información limitada
      return NextResponse.json({
        message: 'Resumen de contactos separados por usuario',
        note: 'Para obtener contactos específicos, proporcione el parámetro userEmail',
        storageType: 'kv',
        usage: 'GET /api/demo-separation?userEmail=usuario@ejemplo.com'
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}