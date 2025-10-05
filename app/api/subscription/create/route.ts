import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}



// Skip initialization during build time
const isBuildTime = process.env.NODE_ENV === 'production' && 
  (process.env.npm_lifecycle_event === 'build' || 
   process.env.NEXT_PHASE === 'phase-production-build' ||
   !process.env.STRIPE_SECRET_KEY);

const stripe = isBuildTime 
  ? null 
  : new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });

export async function POST(request: NextRequest) {
  // Skip during build time
  if (!stripe) {
    console.error('❌ Stripe no está configurado. Verifica las variables de entorno.');
    return NextResponse.json({ 
      error: 'Servicio de pago no configurado. Contacta al administrador.',
      code: 'STRIPE_NOT_CONFIGURED',
      details: 'Las claves de Stripe no están configuradas correctamente'
    }, { status: 503 });
  }

  try {
    const supabase = getSupabaseClient();
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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', userEmail)
      .single();
    
    if (existingUser?.stripe_customer_id) {
      // Retrieve existing customer
      try {
        customer = await stripe.customers.retrieve(existingUser.stripe_customer_id) as Stripe.Customer;
        if (customer.deleted) {
          throw new Error('Customer was deleted');
        }
      } catch (error) {
        console.log('Creating new customer as existing one was not found');
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userEmail: userEmail,
            userId: existingUser.id
          }
        });
        
        // Update user with new customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', existingUser.id);
      }
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userEmail: userEmail,
          userId: existingUser?.id || ''
        }
      });
      
      // Update user with customer ID if user exists
      if (existingUser) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', existingUser.id);
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
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}