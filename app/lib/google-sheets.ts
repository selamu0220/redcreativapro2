// Build time detection - always disable Google Sheets since googleapis is removed
const isBuildTime = true; // Force disable Google Sheets functionality

console.log('Google Sheets module loading:', {
  isBuildTime,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  CI: process.env.CI,
  NEXT_PHASE: process.env.NEXT_PHASE,
  VERCEL_ENV: process.env.VERCEL_ENV,
  npm_lifecycle_event: process.env.npm_lifecycle_event,
  hasGoogleConfig: !!(process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY)
});

// Lazy initialization of Google Sheets client
let googleSheetsClient: any = null;

// Function to get environment variables at runtime
function getGoogleSheetsConfig() {
  return {
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\n/g, '\n'),
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  };
}

export async function getGoogleSheetsClient() {
  // Prevent execution during build time
  if (isBuildTime) {
    console.log('Google Sheets client: Build time detected, returning null');
    return null;
  }

  // Additional safety check for environment variables
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 
      !process.env.GOOGLE_SHEETS_PRIVATE_KEY || 
      !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    console.log('Google Sheets client: Environment variables not configured');
    return null;
  }

  if (!googleSheetsClient) {
    // Prevent any Google Sheets initialization during build time
    if (isBuildTime) {
      return null;
    }
    
    try {
    // Google Sheets functionality is completely disabled
    console.log('Google Sheets client: Functionality disabled');
    return null;
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
   }
   
   return googleSheetsClient;
}

// Function to check if Google Sheets is properly configured
export function isGoogleSheetsConfigured(): boolean {
  // During build time, always return false to prevent initialization
  if (isBuildTime) {
    return false;
  }
  
  const config = getGoogleSheetsConfig();
  return !!(config.GOOGLE_SHEETS_CLIENT_EMAIL && config.GOOGLE_SHEETS_PRIVATE_KEY && config.GOOGLE_SHEETS_SPREADSHEET_ID);
}

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
  // Prevent execution during build time
  if (isBuildTime) {
    return false;
  }
  
  try {
    const sheetsClient = await getGoogleSheetsClient();
    if (!sheetsClient) {
      console.log('initializeSheets: Google Sheets client not available');
      return false;
    }
    
    const config = getGoogleSheetsConfig();
    
    // Verificar si las hojas existen
    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    // Get sheet names with proper typing
    const sheetNames = spreadsheet.data.sheets?.map((sheet: { properties?: { title?: string } }) => sheet.properties?.title).filter(Boolean) || [];
    
    // Crear hoja de contactos si no existe
    if (!sheetNames.includes('Contactos')) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Contactos!A1:G1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', 'Page ID', 'Email', 'Nombre', 'Campos Personalizados', 'Usuario Propietario', 'ID Único']]
        }
      });
    }

    // Crear hoja de páginas si no existe
    if (!sheetNames.includes('Paginas')) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
  // Prevent execution during build time
  if (isBuildTime) {
    return false;
  }
  
  try {
    await initializeSheets();
    const sheetsClient = await getGoogleSheetsClient();
    if (!sheetsClient) {
      console.log('saveContactToSheets: Google Sheets client not available');
      return false;
    }
    
    const config = getGoogleSheetsConfig();

    const values = [[
      contact.timestamp,
      contact.pageId,
      contact.email,
      contact.name || '',
      JSON.stringify(contact.customFields || {}),
      contact.userEmail,
      `${contact.pageId}_${contact.email}_${Date.now()}`
    ]];

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
  // Prevent execution during build time
  if (isBuildTime) {
    return [];
  }
  
  try {
    await initializeSheets();
    const sheetsClient = await getGoogleSheetsClient();
    if (!sheetsClient) {
      console.log('getContactsFromSheets: Google Sheets client not available');
      return [];
    }
    const config = getGoogleSheetsConfig();

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
  // Prevent execution during build time
  if (isBuildTime) {
    // Return a mock object during build time
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    return {
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
  }
  
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
    const sheetsClient = await getGoogleSheetsClient();
    if (!sheetsClient) {
      console.log('saveEmailPageToSheets: Google Sheets client not available, returning mock page');
      return page;
    }
    const config = getGoogleSheetsConfig();
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `Paginas!A${existingRowIndex}:J${existingRowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
    } else {
      // Crear nueva página
      await sheetsClient.spreadsheets.values.append({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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

// Función para obtener páginas de un usuario
export async function getEmailPagesFromSheets(userEmail: string): Promise<EmailPageData[]> {
  // Prevent execution during build time
  if (isBuildTime) {
    return [];
  }
  
  try {
    await initializeSheets();
    const sheetsClient = await getGoogleSheetsClient();
    if (!sheetsClient) {
      console.log('getEmailPagesFromSheets: Google Sheets client not available');
      return [];
    }
    const config = getGoogleSheetsConfig();

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
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
          createdAt: row[9] || new Date().toISOString(),
          updatedAt: row[9] || new Date().toISOString()
        });
      }
    }

    return pages;
  } catch (error) {
    console.error('Error obteniendo páginas de Google Sheets:', error);
    return [];
  }
}

// Función para obtener una página específica por ID
export async function getEmailPageFromSheets(pageId: string, userEmail: string): Promise<EmailPageData | null> {
  // Prevent execution during build time
  if (isBuildTime) {
    return null;
  }
  
  try {
    const pages = await getEmailPagesFromSheets(userEmail);
    return pages.find(page => page.id === pageId) || null;
  } catch (error) {
    console.error('Error obteniendo página de Google Sheets:', error);
    return null;
  }
}

// Función para eliminar una página
export async function deleteEmailPageFromSheets(pageId: string, userEmail: string): Promise<boolean> {
  // Prevent execution during build time
  if (isBuildTime) {
    return false;
  }
  
  try {
    await initializeSheets();
    const sheetsClient = await getGoogleSheetsClient();
    if (!sheetsClient) {
      console.log('deleteEmailPageFromSheets: Google Sheets client not available');
      return false;
    }
    const config = getGoogleSheetsConfig();

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Paginas!A:J',
    });

    const rows = response.data.values || [];
    let rowToDelete = -1;

    // Buscar la fila a eliminar
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === pageId && rows[i][8] === userEmail) {
        rowToDelete = i;
        break;
      }
    }

    if (rowToDelete > 0) {
      // Eliminar la fila
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Asumiendo que 'Paginas' es la primera hoja
                dimension: 'ROWS',
                startIndex: rowToDelete,
                endIndex: rowToDelete + 1
              }
            }
          }]
        }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error eliminando página de Google Sheets:', error);
    return false;
  }
}