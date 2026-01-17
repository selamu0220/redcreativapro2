import { NextRequest, NextResponse } from 'next/server';

// POST /api/users/sync - Stub: Supabase está deshabilitado
export async function POST(request: NextRequest) {
  // Supabase está deshabilitado - ahora usamos Kinde + Appwrite
  return NextResponse.json({
    success: true,
    message: 'User sync not needed - using Kinde for auth'
  });
}
