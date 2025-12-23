import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailAsync, createOrUpdateUserAsync } from '@/app/lib/database';

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
    
    const user = await getUserByEmailAsync(decodedEmail);
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
    
    // Crear o actualizar usuario en la base de datos principal (KV)
    const user = await createOrUpdateUserAsync({ 
      email: decodedEmail,
      subscriptionStatus: 'trial'
    });
    
    // Obtener el UID del usuario desde el header (proporcionado por el middleware)
    const userId = request.headers.get('x-user-uid');
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
