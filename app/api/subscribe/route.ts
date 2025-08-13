import { NextRequest, NextResponse } from 'next/server';
import { 
  getEmailPageByIdFromSheets,
  getEmailPagesFromSheets,
  saveContactToSheets,
  getContactsFromSheets,
  ContactSubmission,
  isGoogleSheetsConfigured
} from '../../lib/google-sheets';
import { 
  getEmailPageByIdAsync,
  createContactAsync,
  getUserContactsAsync,
  getUserEmailPagesAsync,
  updateContactAsync,
  ContactData,
  addCollectedEmailAsync
} from '../../lib/database';
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

// Configuración de Web3Forms
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || '';

// Funciones para Web3Forms
async function sendContactToWeb3Forms(contact: any, userEmail: string): Promise<boolean> {
  try {
    if (!WEB3FORMS_ACCESS_KEY) {
      console.warn('Web3Forms access key not configured');
      return false;
    }

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `Nuevo contacto para ${userEmail}`);
    formData.append('from_name', 'Sistema de Contactos');
    formData.append('email', contact.email);
    formData.append('name', contact.name || 'Sin nombre');
    formData.append('user_email', userEmail);
    formData.append('source', contact.source || 'Formulario web');
    formData.append('tags', Array.isArray(contact.tags) ? contact.tags.join(', ') : '');
    formData.append('created_at', contact.createdAt);
    formData.append('additional_context', contact.additionalContext || '');
    
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Contacto enviado exitosamente via Web3Forms:', result);
      return true;
    } else {
      console.error('Error enviando via Web3Forms:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error conectando con Web3Forms:', error);
    return false;
  }
}

// Función para verificar si Web3Forms está configurado
function isWeb3FormsConfigured(): boolean {
  return !!WEB3FORMS_ACCESS_KEY;
}

// Funciones para el nuevo sistema de contactos separado por usuario
function getUserId(email: string): string {
  return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

function getUserContactsPath(userEmail: string): string {
  const userId = getUserId(userEmail);
  return path.join(process.cwd(), 'data', `contacts-${userId}.json`);
}

async function getUserContactsSeparated(userEmail: string): Promise<any[]> {
  const userId = getUserId(userEmail);
  
  try {
    if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      const kvContacts = await kv.get(`contacts:${userId}`);
      if (kvContacts) {
        return Array.isArray(kvContacts) ? kvContacts : [];
      }
    }
  } catch (error) {
    console.log('KV no disponible, usando archivo local');
  }
  
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

async function saveUserContactsSeparated(userEmail: string, contacts: any[]): Promise<void> {
  const userId = getUserId(userEmail);
  
  try {
    if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      await kv.set(`contacts:${userId}`, contacts);
    }
  } catch (error) {
    console.log('KV no disponible para guardar');
  }
  
  const filePath = getUserContactsPath(userEmail);
  try {
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
  } catch (error) {
    console.error('Error guardando archivo de contactos:', error);
  }
}

// POST - Suscribir nuevo contacto desde página de recopilación
export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO SUBSCRIBE ENDPOINT ===');
    const body = await request.json();
    console.log('Body recibido:', JSON.stringify(body, null, 2));
    const { userEmail, email, name, customFields } = body;

    if (!userEmail || !email) {
      console.log('ERROR: Faltan campos requeridos');
      return NextResponse.json({ error: 'Email del propietario y email del suscriptor son requeridos' }, { status: 400 });
    }
    
    console.log('Validando emails:', { userEmail, email });

    // Validar formato de emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !emailRegex.test(userEmail)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    // Verificar qué sistema de almacenamiento usar (prioridad: Web3Forms + Local > Google Sheets > Solo archivos locales)
    const useWeb3Forms = isWeb3FormsConfigured();
    const useGoogleSheets = isGoogleSheetsConfigured();
    console.log('Web3Forms configurado:', useWeb3Forms);
    console.log('Google Sheets configurado:', useGoogleSheets);
    
    if (useWeb3Forms) {
      // Usar Web3Forms para notificaciones por email + almacenamiento local
      console.log('=== USANDO WEB3FORMS + ALMACENAMIENTO LOCAL ===');
      
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
          
          // Enviar notificación via Web3Forms
          await sendContactToWeb3Forms(existingContact, userEmail);
          
          // También guardar en collected-emails.json
          await addCollectedEmailAsync({
            email,
            userEmail: page.userEmail,
            source: 'web3forms-collection-page'
          });
          
          return NextResponse.json({ 
            message: page.successMessage,
            contact: existingContact,
            storage: {
              type: 'Web3Forms + Local',
              userFile: getUserContactsPath(page.userEmail)
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
      
      // Enviar notificación via Web3Forms
      const emailSent = await sendContactToWeb3Forms(newContact, userEmail);
      
      // También guardar en collected-emails.json
      await addCollectedEmailAsync({
        email,
        userEmail: page.userEmail,
        source: 'web3forms-collection-page'
      });
      
      console.log(`Contacto guardado para ${page.userEmail} y enviado via Web3Forms:`, emailSent);
      
      return NextResponse.json({ 
        message: page.successMessage,
        contact: newContact,
        storage: {
          type: 'Web3Forms + Local',
          userFile: getUserContactsPath(page.userEmail),
          totalContacts: existingContacts.length,
          emailSent
        }
      }, { status: 201 });
      
    } else if (useGoogleSheets) {
      // Usar Google Sheets como base de datos
      console.log('=== USANDO GOOGLE SHEETS ===');
      
      // Obtener la página de recopilación del usuario
      const pages = await getEmailPagesFromSheets(userEmail);
      if (pages.length === 0) {
        return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
      }
      
      const page = pages[0];

      // Verificar que la página está activa
      if (!page.isActive) {
        return NextResponse.json({ error: 'Esta página de suscripción no está activa' }, { status: 400 });
      }

      // Verificar si el contacto ya existe para este usuario
      const existingContacts = await getContactsFromSheets(page.userEmail);
      const existingContact = existingContacts.find(contact => 
        contact.email === email
      );
      
      if (existingContact) {
        return NextResponse.json({ 
          error: 'Este email ya está suscrito',
          message: page.successMessage,
          alreadySubscribed: true
        }, { status: 409 });
      }

      // Crear nuevo contacto en Google Sheets
      const contactSubmission: ContactSubmission = {
        pageId: page.id || userEmail, // Usar el ID de la página o el userEmail como identificador
        email,
        name: page.collectName ? name : undefined,
        customFields: customFields || {},
        timestamp: new Date().toISOString(),
        userEmail: page.userEmail
      };

      const saved = await saveContactToSheets(contactSubmission);
      
      if (saved) {
        // También guardar en collected-emails.json
        await addCollectedEmailAsync({
          email,
          userEmail: page.userEmail,
          source: 'collection-page'
        });
        
        return NextResponse.json({ 
          message: page.successMessage,
          contact: contactSubmission 
        }, { status: 201 });
      } else {
        throw new Error('Error guardando en Google Sheets');
      }
      
    } else {
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

      // Verificar si el contacto ya existe para este usuario usando el nuevo sistema
      const existingContacts = await getUserContactsSeparated(page.userEmail);
      const existingContact = existingContacts.find(contact => contact.email === email);
      
      if (existingContact) {
        if (existingContact.isSubscribed !== false) {
          return NextResponse.json({ 
            error: 'Este email ya está suscrito',
            message: page.successMessage,
            alreadySubscribed: true,
            storage: {
              userFile: getUserContactsPath(page.userEmail),
              kvKey: `contacts:${getUserId(page.userEmail)}`
            }
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
              userFile: getUserContactsPath(page.userEmail),
              kvKey: `contacts:${getUserId(page.userEmail)}`
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
      
      // Guardar usando el nuevo sistema separado
      await saveUserContactsSeparated(page.userEmail, existingContacts);
      
      // También guardar en collected-emails.json
      await addCollectedEmailAsync({
        email,
        userEmail: page.userEmail,
        source: 'collection-page'
      });
      
      console.log(`Contacto guardado para ${page.userEmail} en:`);
      console.log(`- Archivo: ${getUserContactsPath(page.userEmail)}`);
      console.log(`- KV Key: contacts:${getUserId(page.userEmail)}`);
      
      return NextResponse.json({ 
        message: page.successMessage,
        contact: newContact,
        storage: {
          userFile: getUserContactsPath(page.userEmail),
          kvKey: `contacts:${getUserId(page.userEmail)}`,
          totalContacts: existingContacts.length
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error subscribing contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}