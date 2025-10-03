import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { getUserByEmailAsync, createOrUpdateUserAsync } from '../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión actual de Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({
        error: 'Error al obtener sesión',
        details: sessionError.message
      }, { status: 500 });
    }

    if (!session?.user) {
      return NextResponse.json({
        error: 'No hay usuario autenticado',
        authenticated: false,
        hasSession: false
      }, { status: 401 });
    }

    const supabaseUser = session.user;
    console.log('🔍 Usuario de Supabase:', {
      id: supabaseUser.id,
      email: supabaseUser.email,
      created_at: supabaseUser.created_at,
      has_email: !!supabaseUser.email,
      email_length: supabaseUser.email?.length
    });

    // Verificar si el usuario tiene email
    if (!supabaseUser.email) {
      return NextResponse.json({
        error: 'El usuario autenticado no tiene email',
        authenticated: true,
        hasSession: true,
        hasEmail: false,
        supabaseUser: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          created_at: supabaseUser.created_at
        },
        suggestion: 'El usuario necesita un email para ser registrado en la base de datos local'
      }, { status: 400 });
    }

    // Buscar en la base de datos local
    const localUser = await getUserByEmailAsync(supabaseUser.email);

    // Si no existe, intentar crearlo
    if (!localUser) {
      console.log('📝 Usuario no encontrado en BD local, intentando crearlo...');
      try {
        const newUser = await createOrUpdateUserAsync({
          email: supabaseUser.email,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        });
        console.log('✅ Usuario creado exitosamente:', newUser);
        
        return NextResponse.json({
          authenticated: true,
          hasSession: true,
          hasEmail: true,
          supabaseUser: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            created_at: supabaseUser.created_at,
            user_metadata: supabaseUser.user_metadata
          },
          localUser: newUser,
          localUserFound: true,
          localUserCreated: true,
          email: supabaseUser.email
        });
      } catch (createError) {
        console.error('❌ Error al crear usuario:', createError);
        return NextResponse.json({
          authenticated: true,
          hasSession: true,
          hasEmail: true,
          supabaseUser: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            created_at: supabaseUser.created_at,
            user_metadata: supabaseUser.user_metadata
          },
          localUser: null,
          localUserFound: false,
          localUserCreated: false,
          creationError: createError instanceof Error ? createError.message : 'Error desconocido',
          email: supabaseUser.email
        });
      }
    }
    
    return NextResponse.json({
      authenticated: true,
      hasSession: true,
      hasEmail: true,
      supabaseUser: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        created_at: supabaseUser.created_at,
        user_metadata: supabaseUser.user_metadata
      },
      localUser: localUser,
      localUserFound: true,
      localUserCreated: false,
      email: supabaseUser.email
    });

  } catch (error) {
    console.error('❌ Error en debug-user:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}