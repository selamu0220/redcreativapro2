import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define schema for validation
const subscribeSchema = z.object({
  userEmail: z.string().email('Email del propietario inválido'),
  email: z.string().email('Email del suscriptor inválido'),
  name: z.string().optional(),
    customFields: z.record(z.string(), z.string()).optional(),
  });

// Local type definition
interface ContactSubmission {
  pageId: string;
  email: string;
  name?: string;
  customFields?: Record<string, string>;
  timestamp: string;
  userEmail: string;
}

import { 
  getEmailPageByIdAsync,
  createContactAsync,
  getUserContactsAsync,
  getUserEmailPagesAsync,
  updateContactAsync,
  ContactData,
  addCollectedEmailAsync
} from '../../lib/database';
import { kv } from '@vercel/kv';

// KV storage helper functions
const kvGet = async (key: string) => {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error(`Error getting ${key} from KV:`, error);
    return null;
  }
};

const kvSet = async (key: string, value: any) => {
  try {
    await kv.set(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in KV:`, error);
  }
};



// Funciones para el nuevo sistema de contactos separado por usuario
function getUserId(email: string): string {
  return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

function getUserContactsKey(userEmail: string): string {
  const userId = getUserId(userEmail);
  return `contacts:${userId}`;
}

async function getUserContactsSeparated(userEmail: string): Promise<any[]> {
  const contactsKey = getUserContactsKey(userEmail);
  
  try {
    const kvContacts = await kvGet(contactsKey);
    if (kvContacts) {
      return Array.isArray(kvContacts) ? kvContacts : [];
    }
  } catch (error) {
    console.error('Error getting contacts from KV:', error);
  }
  
  return [];
}

async function saveUserContactsSeparated(userEmail: string, contacts: any[]): Promise<void> {
  const contactsKey = getUserContactsKey(userEmail);
  
  try {
    await kvSet(contactsKey, contacts);
  } catch (error) {
    console.error('Error saving contacts to KV:', error);
  }
}

// POST - Suscribir nuevo contacto desde página de recopilación
export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO SUBSCRIBE ENDPOINT ===');
    const body = await request.json();
    console.log('Body recibido:', JSON.stringify(body, null, 2));

    // Validate body with Zod
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }

    const { userEmail, email, name, customFields } = validation.data;

    // Usar sistema de archivos JSON separado por usuario
    console.log('=== USANDO SISTEMA DE CONTACTOS SEPARADO POR USUARIO ===');
      
      // Obtener la página de recopilación del usuario
      console.log('Obteniendo páginas para usuario:', userEmail);
      const pages = await getUserEmailPagesAsync(userEmail);
      console.log('Páginas encontradas:', pages.length);
      
      let page;
      if (pages.length === 0) {
        // Crear página por defecto si no existe ninguna
        console.log('No se encontraron páginas, creando página por defecto');
        page = {
          id: `default-${getUserId(userEmail)}`,
          title: 'Página de Suscripción',
          userEmail: userEmail,
          isActive: true,
          collectName: true,
          successMessage: '¡Gracias por suscribirte! Te mantendremos informado.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        page = pages[0];
      }

      // Verificar que la página está activa
      if (!page.isActive) {
        return NextResponse.json({ error: 'Esta página de suscripción no está activa' }, { status: 400 });
      }

      // Verificar si el contacto ya existe para este usuario
      const existingContacts = await getUserContactsSeparated(page.userEmail);
      const existingContact = existingContacts.find(contact => contact.email === email);
      
      if (existingContact) {
        if (existingContact.isSubscribed !== false) {
          return NextResponse.json({ 
            error: 'Este email ya está suscrito',
            message: page.successMessage,
            alreadySubscribed: true
          }, { status: 409 });
        } else {
          // Reactivar suscripción si estaba desuscrito
          existingContact.isSubscribed = true;
          existingContact.updatedAt = new Date().toISOString();
          existingContact.source = `Página: ${page.title}`;
          
          await saveUserContactsSeparated(page.userEmail, existingContacts);
          
          // También guardar en collected-emails.json
          await addCollectedEmailAsync({
            email,
            userEmail: page.userEmail,
            source: 'collection-page'
          });
          
          return NextResponse.json({ 
            message: page.successMessage,
            contact: existingContact,
            storage: {
              userFile: getUserContactsKey(page.userEmail)
            }
          });
        }
      }

      // Crear nuevo contacto
      const newContact = {
        id: Date.now().toString(),
        email,
        name: page.collectName ? name : undefined,
        userEmail: page.userEmail,
        isSubscribed: true,
        source: `Página: ${page.title}`,
        tags: ['página-suscripción'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Agregar campos personalizados como tags y contexto adicional
      if (customFields && Object.keys(customFields).length > 0) {
        const customTags = Object.entries(customFields).map(([key, value]) => `${key}:${value}`);
        newContact.tags = [...(newContact.tags || []), ...customTags];
        
        // Crear contexto adicional más descriptivo
        const contextEntries = Object.entries(customFields)
          .filter(([key, value]) => value && typeof value === 'string' && value.trim() !== '')
          .map(([key, value]) => `${key}: ${value}`);
        
        if (contextEntries.length > 0) {
          (newContact as any).additionalContext = `Información de captación:\n${contextEntries.join('\n')}\nFuente: ${page.title}`;
        }
      }

      // Agregar el nuevo contacto a la lista
      existingContacts.push(newContact);
      
      // Guardar localmente
      await saveUserContactsSeparated(page.userEmail, existingContacts);
      
      // También guardar en collected-emails.json
      await addCollectedEmailAsync({
        email,
        userEmail: page.userEmail,
        source: 'collection-page'
      });
      
      console.log(`Contacto guardado para ${page.userEmail}`);
      
      return NextResponse.json({ 
        message: page.successMessage,
        contact: newContact,
        storage: {
          userFile: getUserContactsKey(page.userEmail),
          totalContacts: existingContacts.length
        }
      }, { status: 201 });

  } catch (error) {
    console.error('Error subscribing contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}