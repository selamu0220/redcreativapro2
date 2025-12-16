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
      console.error('❌ [ERROR] Supabase client is null. Check environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING');
      console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING');
      return NextResponse.json({ 
        error: 'Database connection not configured', 
        details: 'Missing Supabase environment variables' 
      }, { status: 503 });
    }
    
    console.log('🔍 [DEBUG] GET /api/folders - userId:', userId, 'parentFolderId:', parentFolderId);
    
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
      console.error('❌ [ERROR] Supabase query failed:', error);
      console.error('- Error message:', error.message);
      console.error('- Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Error al obtener carpetas',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DEBUG] GET /api/folders - Found', folders?.length || 0, 'folders');
    return NextResponse.json({ folders: folders || [] });

  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in GET /api/folders:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    console.log('🔍 [DEBUG] POST /api/folders - userId:', userId, 'name:', name, 'parentFolderId:', parentFolderId);

    if (!name) {
      return NextResponse.json({ error: 'El nombre de la carpeta es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ [ERROR] Supabase client is null. Check environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING');
      console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING');
      return NextResponse.json({ 
        error: 'Database connection not configured', 
        details: 'Missing Supabase environment variables' 
      }, { status: 503 });
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
      console.error('❌ [ERROR] Supabase insert failed:', error);
      console.error('- Error message:', error.message);
      console.error('- Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Error al crear carpeta',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DEBUG] POST /api/folders - Folder created successfully:', newFolder);
    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in POST /api/folders:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    console.log('🔍 [DEBUG] PUT /api/folders - userId:', userId, 'id:', id, 'name:', name, 'parentFolderId:', parentFolderId);

    if (!id) {
      return NextResponse.json({ error: 'El ID de la carpeta es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ [ERROR] Supabase client is null. Check environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING');
      console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING');
      return NextResponse.json({ 
        error: 'Database connection not configured', 
        details: 'Missing Supabase environment variables' 
      }, { status: 503 });
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
      console.error('❌ [ERROR] Supabase update failed:', error);
      console.error('- Error message:', error.message);
      console.error('- Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Error al actualizar carpeta',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DEBUG] PUT /api/folders - Folder updated successfully:', updatedFolder);
    return NextResponse.json({ folder: updatedFolder });
  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in PUT /api/folders:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

  console.log('🔍 [DEBUG] DELETE /api/folders - userId:', userId, 'id:', id);

  if (!id) {
    return NextResponse.json({ error: 'El ID de la carpeta es requerido' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ [ERROR] Supabase client is null. Check environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING');
      console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING');
      return NextResponse.json({ 
        error: 'Database connection not configured', 
        details: 'Missing Supabase environment variables' 
      }, { status: 503 });
    }
    
    const { error } = await (supabase as any)
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Carpeta no encontrada' }, { status: 404 });
      }
      console.error('❌ [ERROR] Supabase delete failed:', error);
      console.error('- Error message:', error.message);
      console.error('- Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Error al eliminar carpeta',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DEBUG] DELETE /api/folders - Folder deleted successfully');
    return NextResponse.json({ message: 'Carpeta eliminada exitosamente' });
  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in DELETE /api/folders:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
