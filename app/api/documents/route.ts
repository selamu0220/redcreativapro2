import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/db';

// GET /api/documents - Obtener documentos de un usuario, opcionalmente por carpeta
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category'); // Cambiar folderId por category

  try {
    const supabase = getSupabaseClient();
    let query = (supabase as any)
      .from('documents')
      .select('id, title, category, updated_at, created_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Error getting documents:', error);
      return NextResponse.json({ error: 'Error al obtener documentos' }, { status: 500 });
    }

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Error getting documents:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/documents - Crear un nuevo documento
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, category, tags, is_public } = body;

    if (!title) {
      return NextResponse.json({ error: 'Título es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: newDocument, error } = await (supabase as any)
      .from('documents')
      .insert({
        user_id: userId,
        title,
        content: content || '',
        category: category || null,
        tags: tags || [],
        is_public: is_public || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json({ error: 'Error al crear documento' }, { status: 500 });
    }

    return NextResponse.json({ document: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
