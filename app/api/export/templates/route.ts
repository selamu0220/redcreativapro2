import { NextRequest, NextResponse } from 'next/server';
import { getUserTemplatesAsync } from '../../../lib/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userEmail = request.headers.get('x-user-email');
  if (!userEmail) {
    return NextResponse.json({ error: 'User email required' }, { status: 401 });
  }

  try {
    // Obtener solo las plantillas del usuario autenticado
    const templates = await getUserTemplatesAsync(userEmail);
    
    if (templates.length === 0) {
      return NextResponse.json({ error: 'No templates found for export' }, { status: 404 });
    }

    // Preparar datos para CSV
    const csvData = templates.map(template => ({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category || '',
      tags: template.tags ? template.tags.join(', ') : '',
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));

    // Convertir a CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escapar comillas y envolver en comillas si contiene comas
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Crear respuesta con archivo CSV
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="templates_${userEmail.replace('@', '_')}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error exporting templates:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}