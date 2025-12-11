import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '../../../lib/db';
import { authGuard } from '../../../lib/auth/AuthenticationGuard';
import { paymentSessionManager } from '../../../lib/auth/PaymentSessionManager';
import { auditLogger } from '../../../lib/audit/AuditLogger';
import { conflictDetectionService } from '../../../lib/subscription/ConflictDetectionService';
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
  const requestId = `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
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

    // Requirement 1.1: Verify user authentication before payment operations
    console.log('🔐 Starting secure subscription creation...');
    
    let userIdentity;
    try {
      userIdentity = await authGuard.requireAuthentication();
      console.log('✅ User authenticated:', userIdentity.email);
      
      // Log successful authentication
      await auditLogger.logAuthenticationEvent('subscription_auth_success', {
        userId: userIdentity.userId,
        email: userIdentity.email,
        requestId
      }, {
        userId: userIdentity.userId,
        email: userIdentity.email,
        sessionId: userIdentity.sessionId,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        requestId
      });
    } catch (authError) {
      console.error('❌ Authentication failed:', authError);
      
      // Log authentication failure
      await auditLogger.logSecurityEvent('subscription_auth_failed', {
        error: authError instanceof Error ? authError.message : 'Unknown error',
        requestId
      }, {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        requestId
      }, 'high');
      
      return NextResponse.json(
        { error: 'Authentication required for subscription operations' },
        { status: 401 }
      );
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
    
    const { priceId, userEmail, planName, successUrl, cancelUrl } = await request.json();

    // Requirement 2.1: Verify email matches authenticated user
    if (userEmail && userEmail !== userIdentity.email) {
      console.error('❌ Email mismatch:', { provided: userEmail, authenticated: userIdentity.email });
      return NextResponse.json(
        { error: 'Email does not match authenticated user' },
        { status: 403 }
      );
    }

    // Use authenticated user's email
    const authenticatedEmail = userIdentity.email;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    console.log('🛒 Creating secure checkout session for:', { priceId, email: authenticatedEmail, planName });

    // Check for subscription conflicts before proceeding
    try {
      const conflictResult = await conflictDetectionService.detectSubscriptionConflicts(authenticatedEmail);
      if (conflictResult.hasConflicts) {
        const highSeverityConflicts = conflictResult.conflicts.filter(c => c.severity === 'high');
        if (highSeverityConflicts.length > 0) {
          console.warn('⚠️ High severity subscription conflicts detected:', highSeverityConflicts);
          
          await auditLogger.logSecurityEvent('subscription_conflict_blocked_payment', {
            email: authenticatedEmail,
            conflicts: conflictResult.conflicts.length,
            highSeverityConflicts: highSeverityConflicts.length,
            requestId
          }, {
            userId: userIdentity.userId,
            email: authenticatedEmail,
            requestId
          }, 'high');

          return NextResponse.json(
            { error: 'Subscription conflicts detected. Please contact support.' },
            { status: 409 }
          );
        }
      }
    } catch (conflictError) {
      console.error('❌ Error checking subscription conflicts:', conflictError);
      // Continue with payment but log the error
      await auditLogger.logSystemEvent('conflict_detection_error', {
        email: authenticatedEmail,
        error: conflictError instanceof Error ? conflictError.message : 'Unknown error',
        requestId
      });
    }

    // Create payment session for tracking
    let paymentSession;
    try {
      paymentSession = await paymentSessionManager.createPaymentSession(
        planName || 'premium',
        0, // Amount will be determined by Stripe price
        'EUR'
      );
      console.log('✅ Payment session created:', paymentSession.sessionId);
    } catch (sessionError) {
      console.error('❌ Failed to create payment session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to initialize payment session' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let customer: Stripe.Customer;
    
    // Check if user exists in our database
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', authenticatedEmail)
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
          email: authenticatedEmail,
          metadata: {
            userEmail: authenticatedEmail,
            userId: typedUser.id,
            sessionId: userIdentity.sessionId,
            paymentSessionId: paymentSession.sessionId
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
        email: authenticatedEmail,
        metadata: {
          userEmail: authenticatedEmail,
          userId: typedUser?.id || userIdentity.userId,
          sessionId: userIdentity.sessionId,
          paymentSessionId: paymentSession.sessionId
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
        userEmail: authenticatedEmail,
        priceId: priceId,
        userId: userIdentity.userId,
        sessionId: userIdentity.sessionId,
        paymentSessionId: paymentSession.sessionId,
        planName: planName || 'premium'
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