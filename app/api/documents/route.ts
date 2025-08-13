import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

// GET /api/documents - Obtener documentos de un usuario, opcionalmente por carpeta
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  try {
    const db = await getDbConnection(userId);
    let query: string;
    const params: any[] = [];

    if (folderId) {
      query = 'SELECT id, name, "folderId", "updatedAt" FROM documents WHERE "folderId" = $1 ORDER BY "updatedAt" DESC'; // Excluir contenido para listados
      params.push(folderId);
    } else {
      query = 'SELECT id, name, "folderId", "updatedAt" FROM documents ORDER BY "updatedAt" DESC'; // Excluir contenido para listados
    }

    const { rows: documents } = await db.query(query, params);
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
    // El campo 'title' se mapea a 'name' en la base de datos.
    const { title, content, folderId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Título es requerido' }, { status: 400 });
    }

    const db = await getDbConnection(userId);
    const { rows: newDocument } = await db.query(
      'INSERT INTO documents (name, content, "folderId") VALUES ($1, $2, $3) RETURNING *',
      [title, content || '', folderId || null]
    );

    return NextResponse.json({ document: newDocument[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
