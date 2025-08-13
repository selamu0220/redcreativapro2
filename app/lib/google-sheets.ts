import { google } from 'googleapis';

// Configuración de Google Sheets
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Configurar autenticación
const auth = new google.auth.JWT({
  email: GOOGLE_SHEETS_CLIENT_EMAIL,
  key: GOOGLE_SHEETS_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Tipos de datos
export interface ContactSubmission {
  pageId: string;
  email: string;
  name?: string;
  customFields?: Record<string, string>;
  timestamp: string;
  userEmail: string; // Email del propietario de la página
}

export interface EmailPageData {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  successMessage: string;
  collectName: boolean;
  customFields: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  isActive: boolean;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

// Función para inicializar las hojas si no existen
export async function initializeSheets() {
  try {
    // Verificar si las hojas existen
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    const sheetNames = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
    
    // Crear hoja de contactos si no existe
    if (!sheetNames.includes('Contactos')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Contactos'
              }
            }
          }]
        }
      });

      // Agregar encabezados
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Contactos!A1:G1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', 'Page ID', 'Email', 'Nombre', 'Campos Personalizados', 'Usuario Propietario', 'ID Único']]
        }
      });
    }

    // Crear hoja de páginas si no existe
    if (!sheetNames.includes('Paginas')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Paginas'
              }
            }
          }]
        }
      });

      // Agregar encabezados
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Paginas!A1:J1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Título', 'Descripción', 'Texto Botón', 'Mensaje Éxito', 'Recoger Nombre', 'Campos Personalizados', 'Activa', 'Usuario', 'Fecha Creación']]
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error inicializando Google Sheets:', error);
    return false;
  }
}

// Función para guardar un contacto en Google Sheets
export async function saveContactToSheets(contact: ContactSubmission): Promise<boolean> {
  try {
    await initializeSheets();

    const values = [[
      contact.timestamp,
      contact.pageId,
      contact.email,
      contact.name || '',
      JSON.stringify(contact.customFields || {}),
      contact.userEmail,
      `${contact.pageId}_${contact.email}_${Date.now()}`
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Contactos!A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    });

    return true;
  } catch (error) {
    console.error('Error guardando contacto en Google Sheets:', error);
    return false;
  }
}

// Función para obtener contactos de un usuario
export async function getContactsFromSheets(userEmail: string): Promise<ContactSubmission[]> {
  try {
    await initializeSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Contactos!A:G',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // Solo encabezados o vacío

    const contacts: ContactSubmission[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[5] === userEmail) { // Filtrar por usuario propietario
        contacts.push({
          timestamp: row[0] || '',
          pageId: row[1] || '',
          email: row[2] || '',
          name: row[3] || undefined,
          customFields: row[4] ? JSON.parse(row[4]) : {},
          userEmail: row[5] || ''
        });
      }
    }

    return contacts;
  } catch (error) {
    console.error('Error obteniendo contactos de Google Sheets:', error);
    return [];
  }
}

// Función para guardar una página de email
export async function saveEmailPageToSheets(pageData: Partial<EmailPageData> & { userEmail: string }): Promise<EmailPageData> {
  try {
    await initializeSheets();

    // Generar ID y timestamps si no existen
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    
    const page: EmailPageData = {
      id: pageData.id || nanoid(),
      title: pageData.title || '',
      description: pageData.description || '',
      buttonText: pageData.buttonText || 'Suscribirse',
      successMessage: pageData.successMessage || '¡Gracias por suscribirte!',
      collectName: pageData.collectName !== false,
      customFields: pageData.customFields || [],
      isActive: pageData.isActive !== false,
      userEmail: pageData.userEmail,
      createdAt: pageData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Verificar si la página ya existe
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Paginas!A:J',
    });

    const rows = response.data.values || [];
    let existingRowIndex = -1;

    // Buscar si la página ya existe
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === page.id && rows[i][8] === page.userEmail) {
        existingRowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    const values = [[
      page.id,
      page.title,
      page.description,
      page.buttonText,
      page.successMessage,
      page.collectName.toString(),
      JSON.stringify(page.customFields),
      page.isActive.toString(),
      page.userEmail,
      page.updatedAt
    ]];

    if (existingRowIndex > 0) {
      // Actualizar página existente
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `Paginas!A${existingRowIndex}:J${existingRowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
    } else {
      // Crear nueva página
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Paginas!A:J',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
    }

    return page;
  } catch (error) {
    console.error('Error guardando página en Google Sheets:', error);
    throw error;
  }
}

// Función para obtener páginas de email de un usuario
export async function getEmailPagesFromSheets(userEmail: string): Promise<EmailPageData[]> {
  try {
    await initializeSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Paginas!A:J',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // Solo encabezados o vacío

    const pages: EmailPageData[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[8] === userEmail) { // Filtrar por usuario propietario
        pages.push({
          id: row[0] || '',
          title: row[1] || '',
          description: row[2] || '',
          buttonText: row[3] || 'Suscribirse',
          successMessage: row[4] || '¡Gracias por suscribirte!',
          collectName: row[5] === 'true',
          customFields: row[6] ? JSON.parse(row[6]) : [],
          isActive: row[7] === 'true',
          userEmail: row[8] || '',
          createdAt: row[9] || '',
          updatedAt: new Date().toISOString()
        });
      }
    }

    return pages;
  } catch (error) {
    console.error('Error obteniendo páginas de Google Sheets:', error);
    return [];
  }
}

// Función para obtener una página específica por ID (para páginas públicas)
export async function getEmailPageByIdFromSheets(pageId: string): Promise<EmailPageData | null> {
  try {
    await initializeSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Paginas!A:J',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === pageId && row[7] === 'true') { // ID coincide y está activa
        return {
          id: row[0] || '',
          title: row[1] || '',
          description: row[2] || '',
          buttonText: row[3] || 'Suscribirse',
          successMessage: row[4] || '¡Gracias por suscribirte!',
          collectName: row[5] === 'true',
          customFields: row[6] ? JSON.parse(row[6]) : [],
          isActive: row[7] === 'true',
          userEmail: row[8] || '',
          createdAt: row[9] || '',
          updatedAt: new Date().toISOString()
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error obteniendo página por ID de Google Sheets:', error);
    return null;
  }
}

// Función para actualizar una página
export async function updateEmailPageInSheets(pageId: string, updates: Partial<EmailPageData>, userEmail: string): Promise<EmailPageData | null> {
  try {
    await initializeSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Paginas!A:J',
    });

    const rows = response.data.values || [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === pageId && row[8] === userEmail) {
        // Actualizar los datos
        const updatedPage = {
          id: row[0] || '',
          title: updates.title || row[1] || '',
          description: updates.description || row[2] || '',
          buttonText: updates.buttonText || row[3] || 'Suscribirse',
          successMessage: updates.successMessage || row[4] || '¡Gracias por suscribirte!',
          collectName: updates.collectName !== undefined ? updates.collectName : (row[5] === 'true'),
          customFields: updates.customFields || (row[6] ? JSON.parse(row[6]) : []),
          isActive: updates.isActive !== undefined ? updates.isActive : (row[7] === 'true'),
          userEmail: row[8] || '',
          createdAt: row[9] || '',
          updatedAt: new Date().toISOString()
        };

        // Actualizar la fila en Google Sheets
        const updateRow = [
          updatedPage.id,
          updatedPage.title,
          updatedPage.description,
          updatedPage.buttonText,
          updatedPage.successMessage,
          updatedPage.collectName.toString(),
          JSON.stringify(updatedPage.customFields),
          updatedPage.isActive.toString(),
          updatedPage.userEmail,
          updatedPage.updatedAt
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
          range: `Paginas!A${i + 1}:J${i + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [updateRow]
          }
        });

        return updatedPage;
      }
    }

    return null;
  } catch (error) {
    console.error('Error actualizando página en Google Sheets:', error);
    return null;
  }
}

// Función para eliminar una página
export async function deleteEmailPageFromSheets(pageId: string, userEmail: string): Promise<boolean> {
  try {
    await initializeSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Paginas!A:J',
    });

    const rows = response.data.values || [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === pageId && row[8] === userEmail) {
        // Eliminar la fila
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: 0, // Asumiendo que 'Paginas' es la primera hoja
                  dimension: 'ROWS',
                  startIndex: i,
                  endIndex: i + 1
                }
              }
            }]
          }
        });
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error eliminando página de Google Sheets:', error);
    return false;
  }
}

// Función para verificar la configuración
export function isGoogleSheetsConfigured(): boolean {
  return !!(GOOGLE_SHEETS_PRIVATE_KEY && GOOGLE_SHEETS_CLIENT_EMAIL && GOOGLE_SHEETS_SPREADSHEET_ID);
}