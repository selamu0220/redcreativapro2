import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

// GET /api/folders - Obtener las carpetas de un usuario
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentFolderId = searchParams.get('parentFolderId');

  try {
    const db = await getDbConnection(userId);
    
    let query: string;
    const params: any[] = [];

    if (parentFolderId) {
      // Obtener subcarpetas de una carpeta específica
      query = 'SELECT * FROM folders WHERE "parentFolderId" = $1 ORDER BY name ASC';
      params.push(parentFolderId);
    } else {
      // Obtener carpetas del nivel raíz (sin padre)
      query = 'SELECT * FROM folders WHERE "parentFolderId" IS NULL ORDER BY name ASC';
    }

    const { rows: folders } = await db.query(query, params);
    return NextResponse.json({ folders });

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

    const db = await getDbConnection(userId);
    const { rows: newFolder } = await db.query(
      'INSERT INTO folders (name, "parentFolderId") VALUES ($1, $2) RETURNING *',
      [name, parentFolderId || null]
    );

    return NextResponse.json({ folder: newFolder[0] }, { status: 201 });
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

    const db = await getDbConnection(userId);
    const { rows: updatedFolder, rowCount } = await db.query(
      'UPDATE folders SET name = $1, "parentFolderId" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      [name, parentFolderId || null, id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Carpeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ folder: updatedFolder[0] });
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
    const db = await getDbConnection(userId);
    const { rowCount } = await db.query('DELETE FROM folders WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Carpeta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Carpeta eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
