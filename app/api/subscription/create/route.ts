import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserByEmailAsync } from '@/app/lib/database';

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
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  try {
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
    const existingUser = await getUserByEmailAsync(userEmail);
    
    if (existingUser?.stripeCustomerId) {
      // Retrieve existing customer
      try {
        customer = await stripe.customers.retrieve(existingUser.stripeCustomerId) as Stripe.Customer;
        if (customer.deleted) {
          throw new Error('Customer was deleted');
        }
      } catch (error) {
        console.log('Creating new customer as existing one was not found');
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userEmail: userEmail
          }
        });
      }
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userEmail: userEmail
        }
      });
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
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}