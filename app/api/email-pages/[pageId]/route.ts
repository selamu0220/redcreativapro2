import { NextRequest, NextResponse } from 'next/server';
import { getEmailPageById } from '../../../lib/database';

// Configuración para export estático
export const dynamic = 'force-static';
export const revalidate = false;

// Generar parámetros estáticos para export
export async function generateStaticParams() {
  return [];
}


// GET - Obtener página específica por ID (pública)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;

    if (!pageId) {
      return NextResponse.json({ error: 'ID de página requerido' }, { status: 400 });
    }

    const page = getEmailPageById(pageId);

    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    // Solo devolver la página si está activa (para acceso público)
    if (!page.isActive) {
      return NextResponse.json({ error: 'Página no disponible' }, { status: 404 });
    }

    return NextResponse.json({ page });

  } catch (error) {
    console.error('Error fetching email page:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}