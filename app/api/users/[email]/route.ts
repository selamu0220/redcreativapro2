import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserByEmail, createOrUpdateSupabaseUser } from '@/app/lib/auth/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    console.log('📥 GET /api/users/[email] - Request received');
    const { email } = await params;
    console.log('📧 Raw email param:', email);
    const decodedEmail = decodeURIComponent(email);
    console.log('📧 Decoded email:', decodedEmail);
    
    const user = await getSupabaseUserByEmail(decodedEmail);
    console.log('👤 User found:', !!user, user ? 'exists' : 'not found');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    
    // Crear o actualizar usuario en la base de datos principal
    const user = await createOrUpdateSupabaseUser(decodedEmail, {});
    
    // Obtener el UID del usuario desde el header (proporcionado por el middleware)
    const userId = request.headers.get('x-user-uid');
    
    // Solo intentar provisionar base de datos si PostgreSQL está configurado
    if (userId && process.env.POSTGRES_ADMIN_URL) {
      // Provisionar base de datos individual para el usuario
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const provisionResponse = await fetch(`${request.nextUrl.origin}/api/users/provision-database`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            userEmail: decodedEmail
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const provisionResult = await provisionResponse.json();
        
        if (provisionResponse.ok) {
          console.log(`Base de datos provisionada para ${decodedEmail}:`, provisionResult.message);
        } else {
          console.warn(`No se pudo provisionar base de datos para ${decodedEmail}:`, provisionResult.error);
        }
      } catch (provisionError) {
        console.error('Error provisionando base de datos:', provisionError);
        // No fallar la creación del usuario si falla el provisionamiento
      }
    } else if (userId && !process.env.POSTGRES_ADMIN_URL) {
      console.log(`Usuario ${decodedEmail} creado sin provisionamiento de base de datos (modo desarrollo local)`);
    }
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}