import { NextRequest, NextResponse } from 'next/server';
import { importDocumentsCSV } from '../../../lib/database';

// POST /api/documents/import - Importar documentos desde archivo CSV
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Archivo CSV requerido' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ error: 'El archivo debe ser un CSV válido' }, { status: 400 });
    }

    // Read file content
    const csvContent = await file.text();
    
    if (!csvContent.trim()) {
      return NextResponse.json({ error: 'El archivo CSV está vacío' }, { status: 400 });
    }

    // Import documents
    // Simplified CSV parsing for now
    const csvData = csvContent.split('\n').filter(line => line.trim()).map(line => line.split(','));
    const result = await importDocumentsCSV(userId, csvData);
    
    return NextResponse.json({
      message: 'Importación completada',
      imported: result.imported,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error importing documents:', error);
    return NextResponse.json({ error: 'Error al importar documentos' }, { status: 500 });
  }
}