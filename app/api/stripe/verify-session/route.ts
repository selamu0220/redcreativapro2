import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isDevMode, createMockVerificationResponse } from './dev-mode';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verificar si estamos en modo desarrollo
    if (isDevMode()) {
      console.log('🔧 Modo desarrollo detectado - usando verificación simulada');
      const mockResponse = createMockVerificationResponse(sessionId);
      return NextResponse.json(mockResponse);
    }

    const stripe = getStripeClient();

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Payment was successful
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          customer_email: session.customer_details?.email,
          payment_status: session.payment_status,
          subscription_id: session.subscription,
        },
      });
    } else {
      // Payment was not successful
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}