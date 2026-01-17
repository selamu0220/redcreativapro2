import { NextRequest, NextResponse } from 'next/server';

// GET /api/documents - Stub: Supabase está deshabilitado
export async function GET(request: NextRequest) {
  // Supabase está deshabilitado - retornar datos vacíos
  return NextResponse.json({
    documents: [],
    message: 'Database not configured - using Appwrite instead'
  });
}

// POST /api/documents - Stub: Supabase está deshabilitado
export async function POST(request: NextRequest) {
  // Supabase está deshabilitado - retornar error informativo
  return NextResponse.json({
    error: 'Esta funcionalidad ahora usa Appwrite',
    message: 'Por favor usa /api/appwrite/documents en su lugar'
  }, { status: 501 });
}
