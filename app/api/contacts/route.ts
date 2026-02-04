import { NextRequest, NextResponse } from 'next/server';
import { getUserCollectedEmailsAsync } from '../../lib/database';

// Importar KV de forma segura
let kv: any = null;
try {
  const kvModule = await import('@vercel/kv');
  kv = kvModule.kv;
} catch (error) {
  console.log('⚠️ @vercel/kv no disponible, usando fallback local');
}

// Configuración de SheetDB
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/ztgnmzx1n6nf3';

// Función para convertir collected_emails a formato de contactos
function convertCollectedEmailsToContacts(collectedEmails: any[], userEmail: string) {
  return collectedEmails.map(item => ({
    id: `collected_${item.id}`,
    email: item.email,
    name: item.name || 'Sin nombre',
    userEmail: userEmail,
    isSubscribed: true,
    source: 'Página de recopilación',
    tags: ['email-recopilado'],
    createdAt: item.collected_at || item.collectedAt,
    updatedAt: item.collected_at || item.collectedAt,
    unsubscribeToken: null,
    customData: item.custom_data || item.customData || {},
    questionnaireData: item.questionnaire_data || item.questionnaireData || {}
  }));
}

// Funciones para SheetDB
async function getContactsFromSheetDB(userEmail: string): Promise<any[]> {
  try {
    const response = await fetch(`${SHEETDB_API_URL}/search?userEmail=${encodeURIComponent(userEmail)}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 SheetDB: Found ${data.length} contacts for user ${userEmail}`);
      return Array.isArray(data) ? data : [];
    } else {
      console.error('Error obteniendo contactos de SheetDB:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error conectando con SheetDB:', error);
    return [];
  }
}

// Función para verificar si SheetDB está configurado
function isSheetDBConfigured(): boolean {
  return !!SHEETDB_API_URL;
}

// Helper functions for user-separated contacts
function getUserId(userEmail: string): string {
  return userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// KV helper functions
const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;

async function kvGet<T>(key: string, fallback: () => T): Promise<T> {
  try {
    if (!hasKV || !kv) {
      console.log('📦 KV no disponible, usando fallback para key:', key);
      return fallback();
    }
    const value = await kv.get(key);
    console.log('📦 KV get result for key', key, ':', value ? 'found' : 'not found');
    return value ?? fallback();
  } catch (error) {
    console.error('❌ Error accessing KV for key', key, ':', error);
    return fallback();
  }
}

async function getUserContactsSeparated(userEmail: string) {
  const userId = getUserId(userEmail);
  const kvKey = `contacts:${userId}`;
  
  const contacts = await kvGet(kvKey, () => []);
  console.log(`📦 Contacts loaded from KV for user ${userEmail}:`, contacts);
  return contacts;
}

export async function GET(request: NextRequest) {
  console.log('📥 GET /api/contacts - Request received');
  
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      console.error('❌ User email header missing');
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    console.log(`🔍 Getting contacts for user: ${userEmail}`);
    console.log('🔧 KV Status:', { hasKV, kvAvailable: !!kv });
    
    // Verificar qué sistema de almacenamiento usar (prioridad: SheetDB > Archivos locales/KV)
    const useSheetDB = isSheetDBConfigured();
    console.log('SheetDB configurado:', useSheetDB);
    
    let contacts: any[] = [];
    let storageInfo: { type: string; [key: string]: any } = { type: 'unknown' };
    
    if (useSheetDB) {
      console.log('=== OBTENIENDO CONTACTOS DESDE SHEETDB ===');
      contacts = await getContactsFromSheetDB(userEmail);
      storageInfo = {
        type: 'SheetDB',
        url: SHEETDB_API_URL,
        userEmail: userEmail
      };
    } else {
      console.log('=== OBTENIENDO CONTACTOS DESDE SISTEMA LOCAL ===');
      contacts = await getUserContactsSeparated(userEmail);
      storageInfo = {
        type: 'KV',
        kvKey: `contacts:${getUserId(userEmail)}`
      };
    }
    
    // Obtener emails recopilados de Supabase y agregarlos a los contactos
    console.log('=== OBTENIENDO EMAILS RECOPILADOS DESDE SUPABASE ===');
    try {
      const collectedEmails = await getUserCollectedEmailsAsync(userEmail);
      console.log(`📧 Found ${collectedEmails.length} collected emails for user ${userEmail}`);
      
      if (collectedEmails.length > 0) {
        const convertedContacts = convertCollectedEmailsToContacts(collectedEmails, userEmail);
        contacts = [...contacts, ...convertedContacts];
        console.log(`✅ Added ${convertedContacts.length} collected emails as contacts`);
      }
    } catch (error) {
      console.error('❌ Error fetching collected emails from Supabase:', error);
      // No fallar si hay error con Supabase, continuar con contactos existentes
    }
    
    console.log(`📊 Found ${contacts.length} contacts for user ${userEmail}`);
    
    // Actualizar información de almacenamiento para incluir Supabase
    const finalStorageInfo = {
      ...storageInfo,
      includesSupabase: true,
      supabaseCollectedEmails: true
    };
    
    const response = { 
      contacts: contacts || [],
      count: contacts?.length || 0,
      userEmail: userEmail,
      storage: finalStorageInfo
    };
    
    console.log('✅ Contacts response prepared:', {
      contactCount: response.count,
      storageType: storageInfo.type,
      userEmail: response.userEmail
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Respuesta de error más detallada
    const errorResponse = {
      error: 'Failed to fetch contacts',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    console.log('❌ Sending error response:', errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
