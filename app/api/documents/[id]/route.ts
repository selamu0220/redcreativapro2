import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '../../../lib/database';

// Configuración para export estático
export const dynamic = 'force-static';
export const revalidate = false;

// GET /api/documents/[id] - Get specific document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const document = getDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error getting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}