import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/db';

// GET /api/documents/[id] - Obtener un documento específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = getSupabaseClient();
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error(`Error getting document ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/documents/[id] - Actualizar un documento específico
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { title, content, category, tags, is_public } = body;

    // Validar que al menos un campo esté presente
    if (title === undefined && content === undefined && category === undefined && tags === undefined && is_public === undefined) {
      return NextResponse.json({ error: 'Se requiere al menos un campo para actualizar' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Crear query base
    let query = supabase.from('documents');
    
    // Construir el objeto de actualización solo con campos definidos
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (is_public !== undefined) updateData.is_public = is_public;
    
    const { data: updatedDocument, error } = await (query as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !updatedDocument) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Eliminar un documento específico
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting document ${id}:`, error);
      return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
