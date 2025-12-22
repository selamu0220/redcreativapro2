import { NextRequest, NextResponse } from 'next/server';
import { createEmailPageAsync, getEmailPageByUserEmailAsync } from '../../lib/database';

// POST /api/create-user-and-page - Create user and email collection page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create user in Supabase
    const user = await createOrUpdateSupabaseUser(email, {
      subscription_status: 'trial'
    });

    console.log('✅ Usuario creado:', user?.email);

    // Check if email page already exists
    let page = await getEmailPageByUserEmailAsync(email);
    
    if (!page) {
      // Create default email collection page only if it doesn't exist
      page = await createEmailPageAsync({
        userEmail: email,
        title: 'Recopilacion de Emails',
        description: 'Unete a nuestra lista de correos para recibir contenido exclusivo',
        buttonText: 'Suscribirse',
        successMessage: 'Gracias por suscribirte! Te enviaremos contenido exclusivo pronto.',
        isActive: true,
        collectName: true,
        customFields: [],
        qualificationForm: {
          enabled: false,
          questions: [],
          personalizedGreeting: false,
          segmentationEnabled: false
        }
      });
      console.log('✅ Página creada:', page.id);
    } else {
      console.log('✅ Página ya existe:', page.id);
    }

    return NextResponse.json({
      success: true,
      user: user,
      page: page,
      message: 'Usuario y página creados exitosamente'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario y página', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}