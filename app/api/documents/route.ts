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
    if (!supabase) {
      console.error('❌ [ERROR] Supabase client is null. Check environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING');
      console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'MISSING');
      return NextResponse.json({ 
        error: 'Database connection not configured', 
        details: 'Missing Supabase environment variables' 
      }, { status: 503 });
    }
    
    console.log('🔍 [DEBUG] GET /api/documents - userId:', userId, 'category:', category);
    
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
      console.error('❌ [ERROR] Supabase query failed:', error);
      console.error('- Error message:', error.message);
      console.error('- Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Error al obtener documentos',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DEBUG] GET /api/documents - Found', documents?.length || 0, 'documents');
    return NextResponse.json({ documents });

  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in GET /api/documents:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    // Logs de depuración
    console.log('🔍 [DEBUG] POST /api/documents - Datos recibidos:');
    console.log('- userId:', userId);
    console.log('- body completo:', body);
    console.log('- title:', title);
    console.log('- content (longitud):', content?.length || 0);
    console.log('- content (preview):', content?.substring(0, 100) || 'VACÍO');
    console.log('- category:', category);
    console.log('- tags:', tags);
    console.log('- is_public:', is_public);

    // Validar campos requeridos
    if (!title || title.trim() === '') {
      console.log('❌ [DEBUG] POST /api/documents - Error: título vacío');
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    // Validar que el contenido no esté vacío
    if (!content || content.trim() === '') {
      console.log('❌ [DEBUG] POST /api/documents - Error: contenido vacío');
      return NextResponse.json({ error: 'El contenido del documento no puede estar vacío' }, { status: 400 });
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
    
    const insertData = {
      title: title.trim(),
      content: content.trim(),
      user_id: userId,
      category: category || null,
      tags: tags || [],
      is_public: is_public || false
    };
    
    console.log('📤 [DEBUG] POST /api/documents - Insertando en Supabase:', insertData);
    
    const { data: newDocument, error } = await (supabase as any)
      .from('documents')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ [ERROR] Supabase insert failed:', error);
      console.error('- Error message:', error.message);
      console.error('- Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Error al crear el documento',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DEBUG] POST /api/documents - Documento creado exitosamente:', newDocument);
    return NextResponse.json({ document: newDocument });
  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in POST /api/documents:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
