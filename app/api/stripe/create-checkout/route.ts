import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { authGuard } from '../../../lib/auth/AuthenticationGuard';
import { paymentSessionManager } from '../../../lib/auth/PaymentSessionManager';
import { auditLogger } from '../../../lib/audit/AuditLogger';
import { conflictDetectionService } from '../../../lib/subscription/ConflictDetectionService';
import { errorHandler } from '../../../lib/auth/ErrorHandler';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Stripe Price IDs - Replace with your actual price IDs from Stripe Dashboard
const PRICE_IDS = {
  pro: 'price_1QqKjAAZjhZ6eQncSynlMoCl7I0D1KV3jLLND1JBeWymZ0ytRKBahMlvprmBuVACZlefkSQYqcAajUhhvcIE90yx00OiBLlHVv', // 5.00€/month
};

export async function POST(request: NextRequest) {
  const requestId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  try {
    // Log payment initiation
    await auditLogger.logPaymentEvent('payment_initiation', {
      requestId,
      timestamp: new Date().toISOString()
    }, {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      requestId
    });

    // Requirement 1.1: Verify user authentication before payment operations
    console.log('🔐 Starting secure checkout creation...');
    
    let userIdentity;
    try {
      userIdentity = await authGuard.requireAuthentication();
      console.log('✅ User authenticated:', userIdentity.email);
      
      // Log successful authentication
      await auditLogger.logAuthenticationEvent('payment_auth_success', {
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
      await auditLogger.logSecurityEvent('payment_auth_failed', {
        error: authError instanceof Error ? authError.message : 'Unknown error',
        requestId
      }, {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        requestId
      }, 'high');
      
      return NextResponse.json(
        { error: 'Authentication required for payment operations' },
        { status: 401 }
      );
    }

    // Requirement 1.4: Validate session remains active during payment process
    try {
      await authGuard.requireAuthentication();
      console.log('✅ Session validated for payment');
    } catch (sessionError) {
      console.error('❌ Session validation failed:', sessionError);
      return NextResponse.json(
        { error: 'Session expired or invalid for payment operations' },
        { status: 401 }
      );
    }

    const stripe = getStripeClient();
    const { email, planType = 'pro', amount } = await request.json();

    // Requirement 2.1: Verify email matches authenticated user
    if (email && email !== userIdentity.email) {
      console.error('❌ Email mismatch:', { provided: email, authenticated: userIdentity.email });
      return NextResponse.json(
        { error: 'Email does not match authenticated user' },
        { status: 403 }
      );
    }

    // Use authenticated user's email if not provided
    const userEmail = email || userIdentity.email;

    // Check for subscription conflicts before proceeding
    try {
      const conflictResult = await conflictDetectionService.detectSubscriptionConflicts(userEmail);
      if (conflictResult.hasConflicts) {
        const highSeverityConflicts = conflictResult.conflicts.filter(c => c.severity === 'high');
        if (highSeverityConflicts.length > 0) {
          console.warn('⚠️ High severity subscription conflicts detected:', highSeverityConflicts);
          
          await auditLogger.logSecurityEvent('subscription_conflict_blocked_payment', {
            email: userEmail,
            conflicts: conflictResult.conflicts.length,
            highSeverityConflicts: highSeverityConflicts.length,
            requestId
          }, {
            userId: userIdentity.userId,
            email: userEmail,
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
        email: userEmail,
        error: conflictError instanceof Error ? conflictError.message : 'Unknown error',
        requestId
      });
    }

    // Bypass payment for specific email (keep existing logic)
    if (userEmail === 'selamu.garcia@gmail.com') {
      console.log('Bypassing Stripe checkout for selamu.garcia@gmail.com');
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/success?free_access=true` });
    }

    // Get the price ID for the plan
    const priceId = PRICE_IDS[planType as keyof typeof PRICE_IDS];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Calculate amount from price if not provided
    const planAmount = amount || (planType === 'pro' ? 500 : 500); // 5.00€ in cents

    // Create payment session for tracking
    let paymentSession;
    try {
      paymentSession = await paymentSessionManager.createPaymentSession(
        planType,
        planAmount,
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

    // Create or retrieve customer with enhanced metadata
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      
      // Update customer metadata with current session info
      customer = await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          planType: planType,
          userId: userIdentity.userId,
          sessionId: userIdentity.sessionId,
          paymentSessionId: paymentSession.sessionId,
          lastPaymentAttempt: new Date().toISOString(),
        },
      });
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          planType: planType,
          userId: userIdentity.userId,
          sessionId: userIdentity.sessionId,
          paymentSessionId: paymentSession.sessionId,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // Requirement 2.1: Include authenticated user metadata in checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        // Requirement 2.1: Include user email as metadata
        userEmail: userEmail,
        planType: planType,
        userId: userIdentity.userId,
        authSessionId: userIdentity.sessionId,
        paymentSessionId: paymentSession.sessionId,
        createdAt: new Date().toISOString(),
        // Security metadata for validation
        emailVerified: 'true',
        authenticationMethod: 'supabase',
      },
      subscription_data: {
        metadata: {
          userEmail: userEmail,
          planType: planType,
          userId: userIdentity.userId,
          authSessionId: userIdentity.sessionId,
          paymentSessionId: paymentSession.sessionId,
          subscriptionCreatedAt: new Date().toISOString(),
        },
      },
      // Add session expiry for security
      expires_at: Math.floor((Date.now() + (30 * 60 * 1000)) / 1000), // 30 minutes
    });

    // Update payment session with Stripe session ID
    paymentSessionManager.updatePaymentSession(
      userIdentity.userId,
      planType,
      session.id
    );

    console.log('✅ Secure checkout session created:', {
      sessionId: session.id,
      userEmail: userEmail,
      userId: userIdentity.userId,
      planType: planType,
      amount: planAmount,
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      paymentSessionId: paymentSession.sessionId,
    });
  } catch (error) {
    console.error('❌ Error creating secure checkout session:', error);
    
    // Enhanced error logging for security
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    };
    
    console.error('Checkout creation error details:', errorDetails);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}