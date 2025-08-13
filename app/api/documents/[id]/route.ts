import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

// GET /api/documents/[id] - Obtener un documento específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDbConnection(userId);
    const { rows, rowCount } = await db.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ document: rows[0] });
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
    const { title, content, folderId } = body;

    const db = await getDbConnection(userId);

    // Construir la consulta dinámicamente de forma segura
    const updates: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    if (title !== undefined) {
        updates.push(`name = $${queryIndex++}`);
        values.push(title);
    }
    if (content !== undefined) {
        updates.push(`content = $${queryIndex++}`);
        values.push(content);
    }
    if (folderId !== undefined) {
        updates.push(`"folderId" = $${queryIndex++}`);
        values.push(folderId);
    }

    if (updates.length === 0) {
        return NextResponse.json({ error: 'Se requiere al menos un campo para actualizar' }, { status: 400 });
    }

    values.push(id);

    const { rows: updatedDocument, rowCount } = await db.query(
      `UPDATE documents SET ${updates.join(', ')}, "updatedAt" = NOW() WHERE id = $${queryIndex} RETURNING *`,
      values
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ document: updatedDocument[0] });
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
    const db = await getDbConnection(userId);
    const { rowCount } = await db.query('DELETE FROM documents WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
