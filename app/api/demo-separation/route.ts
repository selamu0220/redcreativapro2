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
    // KV no disponible
  }
  
  // Fallback a archivo local
  const filePath = getUserContactsPath(userEmail);
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    // Archivo no existe o error de lectura
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
    }
  } catch (error) {
    // KV no disponible
  }
  
  // Guardar en archivo local como respaldo
  const filePath = getUserContactsPath(userEmail);
  try {
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
  } catch (error) {
    throw new Error(`Error guardando archivo: ${error}`);
  }
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
            file: getUserContactsPath(userEmail),
            kvKey: `contacts:${getUserId(userEmail)}`,
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
          file: getUserContactsPath(userEmail),
          kvKey: `contacts:${getUserId(userEmail)}`,
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
          const contact = {
            id: `${Date.now()}-${i}`,
            email: `contacto${i}@${user.email.split('@')[1]}`,
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
            file: getUserContactsPath(user.email),
            kvKey: `contacts:${getUserId(user.email)}`
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
          separateFiles: results.map(r => r.storage.file),
          separateKvKeys: results.map(r => r.storage.kvKey)
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
    } else {
      // Mostrar resumen de todos los usuarios
      const dataDir = path.join(process.cwd(), 'data');
      const files = fs.readdirSync(dataDir);
      const contactFiles = files.filter(f => f.startsWith('contacts-') && f.endsWith('.json'));
      
      const summary = [];
      
      for (const file of contactFiles) {
        const filePath = path.join(dataDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const contacts = JSON.parse(content);
          const userId = file.replace('contacts-', '').replace('.json', '');
          const userEmail = contacts.length > 0 ? contacts[0].userEmail : 'desconocido';
          
          summary.push({
            file: file,
            userEmail: userEmail,
            userId: userId,
            contactsCount: contacts.length,
            filePath: filePath
          });
        } catch (error) {
          summary.push({
            file: file,
            error: 'Error leyendo archivo',
            filePath: filePath
          });
        }
      }
      
      return NextResponse.json({
        message: 'Resumen de contactos separados por usuario',
        totalFiles: contactFiles.length,
        files: summary,
        dataDirectory: dataDir
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}