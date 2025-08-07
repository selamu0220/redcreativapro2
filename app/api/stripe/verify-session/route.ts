import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
    });
    
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

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