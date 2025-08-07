import { NextRequest, NextResponse } from 'next/server';
import { 

  getUserEmailPages, 
  createEmailPage, 
  updateEmailPage, 
  deleteEmailPage,
  EmailCollectionPageData 
} from '../../lib/database';

// GET - Obtener páginas de recopilación del usuario
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const pages = getUserEmailPages(userEmail);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching email pages:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva página de recopilación
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      buttonText = 'Suscribirse', 
      successMessage = '¡Gracias por suscribirte!',
      isActive = true,
      collectName = true,
      customFields = [],
      qualificationForm = {
        enabled: false,
        questions: [],
        personalizedGreeting: true,
        segmentationEnabled: true
      }
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Título y descripción son requeridos' }, { status: 400 });
    }

    const pageData: Omit<EmailCollectionPageData, 'id' | 'createdAt' | 'updatedAt'> = {
      userEmail,
      title,
      description,
      buttonText,
      successMessage,
      isActive,
      collectName,
      customFields,
      qualificationForm
    };

    const newPage = createEmailPage(pageData);
    return NextResponse.json({ page: newPage }, { status: 201 });
  } catch (error) {
    console.error('Error creating email page:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar página de recopilación
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { id, title, description, buttonText, successMessage, isActive, collectName, customFields, qualificationForm } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de la página es requerido' }, { status: 400 });
    }

    const updatedPage = updateEmailPage(id, {
      title,
      description,
      buttonText,
      successMessage,
      isActive,
      collectName,
      customFields,
      qualificationForm
    });

    if (!updatedPage) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    // Verificar que la página pertenece al usuario
    if (updatedPage.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Error updating email page:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar página de recopilación
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const url = new URL(request.url);
    const pageId = url.searchParams.get('id');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    if (!pageId) {
      return NextResponse.json({ error: 'ID de la página es requerido' }, { status: 400 });
    }

    // Verificar que la página pertenece al usuario antes de eliminar
    const pages = getUserEmailPages(userEmail);
    const page = pages.find(p => p.id === pageId);
    
    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    const deleted = deleteEmailPage(pageId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Error al eliminar página' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Página eliminada exitosamente' });
    
    } catch (error) {
    console.error('Error deleting email page:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}