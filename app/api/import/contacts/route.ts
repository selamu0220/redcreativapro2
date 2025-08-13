import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { createContactAsync, ContactData } from '../../../lib/database';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userEmail = request.headers.get('x-user-email');
  console.log('📥 [BACKEND] Import request received for user:', userEmail);
  console.log('🔍 [BACKEND] Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('📋 [BACKEND] Request method:', request.method);
  console.log('🌐 [BACKEND] Request URL:', request.url);
  
  if (!userEmail) {
    console.log('❌ [BACKEND] No user email provided');
    return NextResponse.json({ error: 'User email required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      console.log('❌ [BACKEND] No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('📄 [BACKEND] File received:', { name: (file as File).name, size: file.size, type: file.type });
    const fileContent = await file.text();
    console.log('📝 [BACKEND] File content preview:', fileContent.substring(0, 200) + '...');
    console.log('📊 [BACKEND] File content length:', fileContent.length);
    
    // Validar que el contenido no esté vacío
    if (!fileContent.trim()) {
      console.log('❌ [BACKEND] File content is empty');
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }
    
    // Validar que parezca un CSV
    const lines = fileContent.split('\n');
    if (lines.length < 2) {
      console.log('❌ [BACKEND] File has insufficient lines:', lines.length);
      return NextResponse.json({ error: 'File must have at least header and one data row' }, { status: 400 });
    }
    
    console.log('✅ [BACKEND] File validation passed, proceeding with CSV parsing...');

    return new Promise<NextResponse>((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          console.log('📊 [BACKEND] Papa.parse results:', { 
            dataLength: results.data.length, 
            errors: results.errors,
            meta: results.meta 
          });
          
          if (results.errors && results.errors.length > 0) {
            console.log('⚠️ [BACKEND] Papa.parse errors detected:', results.errors);
          }
          
          if (!results.data || results.data.length === 0) {
            console.log('❌ [BACKEND] No data parsed from CSV');
            resolve(NextResponse.json({ error: 'No valid data found in CSV file' }, { status: 400 }));
            return;
          }
          
          const importedContacts: ContactData[] = [];
          const errors: string[] = [];

          for (const row of results.data) {
            console.log('🔍 Processing row:', row);
            // Basic validation and mapping
            const contactEmail = (row as any).email || (row as any).Email;
            if (!contactEmail) {
              errors.push(`Row missing email: ${JSON.stringify(row)}`);
              continue;
            }

            try {
              const newContact: Omit<ContactData, 'id' | 'createdAt' | 'updatedAt'> = {
                userEmail: userEmail,
                email: contactEmail,
                name: (row as any).name || (row as any).Name || '',
                isSubscribed: true, // Default to subscribed on import
                source: 'CSV Import',
                tags: ((row as any).tags || (row as any).Tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
                // Add other fields as needed from your ContactData interface and CSV columns
              };
              console.log(`[IMPORT] Creating contact:`, JSON.stringify(newContact, null, 2));
              const createdContact = await createContactAsync(newContact);
              console.log(`[IMPORT] Contact created successfully:`, createdContact.id);
              importedContacts.push(createdContact);
            } catch (e: any) {
              console.error(`[IMPORT] Error creating contact ${contactEmail}:`, e);
              errors.push(`Error processing contact ${contactEmail}: ${e.message}`);
            }
          }

          const successResponse = errors.length > 0 
            ? { message: `Import completed with ${importedContacts.length} contacts imported and ${errors.length} errors.`, importedCount: importedContacts.length, errors }
            : { message: `Successfully imported ${importedContacts.length} contacts.`, importedCount: importedContacts.length };
          
          console.log('✅ [BACKEND] Import completed successfully:', successResponse);
          resolve(NextResponse.json(successResponse, { status: 200 }));
        },
        error: (err: any) => {
          console.error('❌ [BACKEND] Papa.parse error:', err);
          const errorResponse = { error: `CSV parsing error: ${err.message}` };
          console.log('❌ [BACKEND] Sending error response:', errorResponse);
          resolve(NextResponse.json(errorResponse, { status: 500 }));
        },
      });
    });
  } catch (error: any) {
    console.error('❌ [BACKEND] Unexpected error importing contacts:', error);
    console.error('❌ [BACKEND] Error stack:', error.stack);
    const errorResponse = { error: `Server error: ${error.message}` };
    console.log('❌ [BACKEND] Sending final error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
