import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserTemplatesAsync, 
  createTemplateAsync, 
  updateTemplateAsync, 
  deleteTemplateAsync,
  TemplateData 
} from '../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const templates = await getUserTemplatesAsync(userEmail);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      name, 
      subject, 
      content, 
      category = '',
      tags = [],
      isActive = true
    } = body;

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Nombre, asunto y contenido son requeridos' }, { status: 400 });
    }

    const templateData: Omit<TemplateData, 'id' | 'createdAt' | 'updatedAt'> = {
      userEmail,
      name,
      subject,
      content,
      category,
      tags,
      isActive
    };

    const newTemplate = await createTemplateAsync(templateData);
    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { id, name, subject, content, category, tags, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de la plantilla es requerido' }, { status: 400 });
    }

    const updatedTemplate = await updateTemplateAsync(id, {
      name,
      subject,
      content,
      category,
      tags,
      isActive
    });

    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID de la plantilla es requerido' }, { status: 400 });
    }

    const deleted = await deleteTemplateAsync(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}