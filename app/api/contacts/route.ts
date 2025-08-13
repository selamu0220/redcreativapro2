import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

// Configuración de SheetDB
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/ztgnmzx1n6nf3';

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

function getUserContactsPath(userEmail: string): string {
  const userId = getUserId(userEmail);
  const dataDir = process.env.VERCEL ? '/tmp/data' : path.join(process.cwd(), 'data');
  return path.join(dataDir, `contacts-${userId}.json`);
}

async function getUserContactsSeparated(userEmail: string) {
  const userId = getUserId(userEmail);
  const kvKey = `contacts:${userId}`;
  
  try {
    // Try KV first
    if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      const kvContacts = await kv.get(kvKey);
      if (kvContacts) {
        console.log(`📦 Contacts loaded from KV for user ${userEmail}:`, kvContacts);
        return kvContacts;
      }
    }
  } catch (error) {
    console.log('KV not available, using file system:', error);
  }
  
  // Fallback to file system
  const filePath = getUserContactsPath(userEmail);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const contacts = JSON.parse(data);
      console.log(`📁 Contacts loaded from file for user ${userEmail}:`, contacts);
      return contacts;
    }
  } catch (error) {
    console.error('Error reading contacts file:', error);
  }
  
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    console.log(`🔍 Getting contacts for user: ${userEmail}`);
    
    // Verificar qué sistema de almacenamiento usar (prioridad: SheetDB > Archivos locales/KV)
    const useSheetDB = isSheetDBConfigured();
    console.log('SheetDB configurado:', useSheetDB);
    
    let contacts = [];
    let storageInfo = {};
    
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
        type: 'Local/KV',
        file: getUserContactsPath(userEmail),
        kvKey: `contacts:${getUserId(userEmail)}`
      };
    }
    
    console.log(`📊 Found ${contacts.length} contacts for user ${userEmail}`);
    
    return NextResponse.json({ 
      contacts: contacts || [],
      count: contacts?.length || 0,
      userEmail: userEmail,
      storage: storageInfo
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}