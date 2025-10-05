import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
  try {
    const stripe = getStripeClient();
    
    const { email, planType = 'pro' } = await request.json();

    // Bypass payment for specific email
    if (email === 'selamu.garcia@gmail.com') {
      console.log('Bypassing Stripe checkout for selamu.garcia@gmail.com');
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/success?free_access=true` });
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the price ID for the plan
    const priceId = PRICE_IDS[planType as keyof typeof PRICE_IDS];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          planType: planType,
        },
      });
    }

    // Create checkout session
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
        userEmail: email,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userEmail: email,
          planType: planType,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}