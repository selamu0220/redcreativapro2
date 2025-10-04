import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/db';

// GET /api/folders - Obtener las carpetas de un usuario
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentFolderId = searchParams.get('parentFolderId');

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    let query = (supabase as any).from('folders').select('*').order('name', { ascending: true });

    if (parentFolderId) {
      // Obtener subcarpetas de una carpeta específica
      query = query.eq('parentFolderId', parentFolderId);
    } else {
      // Obtener carpetas del nivel raíz (sin padre)
      query = query.is('parentFolderId', null);
    }

    const { data: folders, error } = await query;
    
    if (error) {
      console.error('Error getting folders:', error);
      return NextResponse.json({ error: 'Error al obtener carpetas' }, { status: 500 });
    }

    return NextResponse.json({ folders: folders || [] });

  } catch (error) {
    console.error('Error getting folders:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/folders - Crear una nueva carpeta
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, parentFolderId } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre de la carpeta es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const { data: newFolder, error } = await (supabase as any)
      .from('folders')
      .insert({
        name,
        parentFolderId: parentFolderId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return NextResponse.json({ error: 'Error al crear carpeta' }, { status: 500 });
    }

    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/folders - Actualizar una carpeta
export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, parentFolderId } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID de la carpeta es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const { data: updatedFolder, error } = await (supabase as any)
      .from('folders')
      .update({
        name,
        parentFolderId: parentFolderId || null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Carpeta no encontrada' }, { status: 404 });
      }
      console.error('Error updating folder:', error);
      return NextResponse.json({ error: 'Error al actualizar carpeta' }, { status: 500 });
    }

    return NextResponse.json({ folder: updatedFolder });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/folders - Eliminar una carpeta
export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'El ID de la carpeta es requerido' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const { error } = await (supabase as any)
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Carpeta no encontrada' }, { status: 404 });
      }
      console.error('Error deleting folder:', error);
      return NextResponse.json({ error: 'Error al eliminar carpeta' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Carpeta eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
