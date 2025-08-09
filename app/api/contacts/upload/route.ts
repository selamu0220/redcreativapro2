import { NextRequest, NextResponse } from 'next/server';
import { saveContactsAsync, getContactsAsync, createContactAsync } from '../../../lib/database';
import Papa from 'papaparse';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userEmail = formData.get('userEmail') as string;

    if (!file || !userEmail) {
      return NextResponse.json(
        { error: 'Archivo y email de usuario son requeridos' },
        { status: 400 }
      );
    }

    // Leer el contenido del archivo CSV
    const text = await file.text();
    
    // Parsear el CSV
    const results = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim()
    });

    if (results.errors.length > 0) {
      return NextResponse.json(
        { error: 'Error al parsear el archivo CSV', details: results.errors },
        { status: 400 }
      );
    }

    let imported = 0;
    let errors = [];
    const newContacts = [];

    // Procesar cada fila del CSV
    for (const row of results.data as any[]) {
      try {
        const email = row.email?.trim();
        const name = row.name?.trim() || row.nombre?.trim() || '';

        if (!email || !email.includes('@')) {
          errors.push(`Email inválido: ${email}`);
          continue;
        }

        // Crear el contacto
        const contactData = {
          email,
          name,
          userEmail,
          isSubscribed: true,
          source: 'CSV Upload',
          tags: ['csv-import']
        };

        const newContact = await createContactAsync(contactData);
        newContacts.push(newContact);
        imported++;
      } catch (error) {
        errors.push(`Error procesando fila: ${JSON.stringify(row)}`);
      }
    }

    // Guardar todos los contactos
    if (newContacts.length > 0) {
      const existingContacts = await getContactsAsync();
      const allContacts = [...existingContacts, ...newContacts];
      await saveContactsAsync(allContacts);
    }

    return NextResponse.json({
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
      message: `Se importaron ${imported} contactos exitosamente`
    });

  } catch (error) {
    console.error('Error uploading contacts:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}