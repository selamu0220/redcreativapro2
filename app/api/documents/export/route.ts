import { NextRequest, NextResponse } from 'next/server';
import { exportDocumentsCSV } from '../../../lib/database';

// GET /api/documents/export - Exportar documentos del usuario a CSV
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

    try {
      const csvContent = await exportDocumentsCSV(userId);
      
      // Create response with CSV content
      const response = new NextResponse([csvContent] as any, {
        status: 200,

      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="documentos_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error exporting documents:', error);
    return NextResponse.json({ error: 'Error al exportar documentos' }, { status: 500 });
  }
}