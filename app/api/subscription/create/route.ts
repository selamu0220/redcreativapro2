import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '../../../lib/db';
import { isDevMode, createMockCheckoutSession } from './dev-mode';

// Configuración de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});


function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurado');
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verificar si estamos en modo desarrollo
    if (isDevMode()) {
      console.log('🔧 Modo desarrollo detectado - usando sesión simulada');
      const { userEmail, priceId } = await request.json();
      
      if (!priceId || !userEmail) {
        return NextResponse.json(
          { error: 'Price ID and user email are required' },
          { status: 400 }
        );
      }
      
      const mockSession = createMockCheckoutSession(userEmail, priceId);
      return NextResponse.json(mockSession);
    }

    // Inicializar Stripe y Supabase
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    console.log('🔑 Stripe configurado correctamente');
    
    const { priceId, userEmail, successUrl, cancelUrl } = await request.json();

    if (!priceId || !userEmail) {
      return NextResponse.json(
        { error: 'Price ID and user email are required' },
        { status: 400 }
      );
    }

    console.log('🛒 Creating checkout session for:', { priceId, userEmail });

    // Get or create Stripe customer
    let customer: Stripe.Customer;
    
    // Check if user exists in our database
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', userEmail)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle null results properly
    
    // Type assertion to help TypeScript understand the structure
    type UserRecord = {
      id: string;
      stripe_customer_id: string | null;
    } | null;
    
    const typedUser = existingUser as UserRecord;
    
    if (typedUser && typedUser.stripe_customer_id) {
      // Retrieve existing customer
      try {
        customer = await stripe.customers.retrieve(typedUser.stripe_customer_id) as Stripe.Customer;
        if ((customer as any).deleted) {
          throw new Error('Customer was deleted');
        }
      } catch (error) {
        console.log('Creating new customer as existing one was not found');
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userEmail: userEmail,
            userId: typedUser.id
          }
        });
        
        // Update user with new customer ID
        const updateData: any = { stripe_customer_id: customer.id };
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update(updateData)
          .eq('id', typedUser.id);
      }
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userEmail: userEmail,
          userId: typedUser?.id || ''
        }
      });
      
      // Update user with customer ID if user exists
      if (typedUser) {
        const updateData: any = { stripe_customer_id: customer.id };
        await (supabase as any)
          .from('users')
          .update(updateData)
          .eq('id', typedUser.id);
      }
    }

    // Determine if this is a one-time payment (lifetime) or subscription
    const price = await stripe.prices.retrieve(priceId);
    const isLifetime = price.type === 'one_time';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planes?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/planes?canceled=true`,
      metadata: {
        userEmail: userEmail,
        priceId: priceId
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    
    // Manejo específico para errores de autenticación de Stripe
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key provided') || 
          error.message.includes('Invalid API Key') ||
          error.message.includes('No API key provided')) {
        return NextResponse.json(
          { 
            error: 'Servicio de pago no configurado. Contacta al administrador.',
            code: 'STRIPE_NOT_CONFIGURED',
            details: 'Las claves de Stripe no están configuradas correctamente'
          },
          { status: 503 }
        );
      }
    }
    
    // Manejo mejorado de errores con más detalles
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Detectar tipos específicos de errores
      if (error.message.includes('Invalid API Key') || 
          error.message.includes('No API key provided')) {
        errorCode = 'STRIPE_AUTH_ERROR';
        errorMessage = 'Error de autenticación con Stripe. Verifica las claves API.';
      } else if (error.message.includes('STRIPE_SECRET_KEY')) {
        errorCode = 'STRIPE_CONFIG_ERROR';
        errorMessage = 'Configuración de Stripe incompleta.';
      } else if (error.message.includes('Supabase')) {
        errorCode = 'DATABASE_ERROR';
        errorMessage = 'Error de conexión con la base de datos.';
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear sesión de pago',
        code: errorCode,
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}