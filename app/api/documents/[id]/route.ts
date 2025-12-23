import { NextRequest, NextResponse } from 'next/server';
// GET /api/documents/[id] - Obtener un documento específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { id } = await params;

    try {
      const supabase = null;
      if (!supabase) {
        // Supabase client not available (using Clerk)
        return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
      }
    
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

    // Logs de depuración
    console.log('🔍 [DEBUG] PUT /api/documents/[id] - Datos recibidos:');
    console.log('- userId:', userId);
    console.log('- documentId:', id);
    console.log('- body completo:', body);
    console.log('- title:', title);
    console.log('- content (longitud):', content?.length || 0);
    console.log('- content (preview):', content?.substring(0, 100) || 'VACÍO');
    console.log('- category:', category);
    console.log('- tags:', tags);
    console.log('- is_public:', is_public);

    // Validar que al menos un campo esté presente
    if (title === undefined && content === undefined && category === undefined && tags === undefined && is_public === undefined) {
      console.log('❌ [DEBUG] PUT /api/documents/[id] - Error: no hay campos para actualizar');
      return NextResponse.json({ error: 'Se requiere al menos un campo para actualizar' }, { status: 400 });
    }

    const supabase = null;
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // Crear query base
    let query = supabase.from('documents');
    
    // Construir el objeto de actualización solo con campos definidos
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      // Validar que el contenido no esté vacío si se está actualizando
      if (content.trim() === '') {
        console.log('❌ [DEBUG] PUT /api/documents/[id] - Error: contenido vacío');
        return NextResponse.json({ error: 'El contenido del documento no puede estar vacío' }, { status: 400 });
      }
      updateData.content = content.trim();
    }
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (is_public !== undefined) updateData.is_public = is_public;
    
    console.log('📤 [DEBUG] PUT /api/documents/[id] - Actualizando en Supabase:', updateData);
    
    const { data: updatedDocument, error } = await (query as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !updatedDocument) {
      console.error('❌ [DEBUG] PUT /api/documents/[id] - Error de Supabase:', error);
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    console.log('✅ [DEBUG] PUT /api/documents/[id] - Documento actualizado exitosamente:', updatedDocument);
    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error(`❌ [DEBUG] PUT /api/documents/[id] - Error general:`, error);
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
      const supabase = null;
      if (!supabase) {
        // Supabase client not available (using Clerk)
        return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
      }
    
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
