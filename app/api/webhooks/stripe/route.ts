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

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}



const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseClient();
  console.log('Checkout completed:', session.id);

  if (!session.customer || !session.metadata?.userId) {
    console.error('Missing customer or userId in checkout session');
    return;
  }

  // Update user's stripe_customer_id if not already set
  const { error: userError } = await supabase
    .from('users')
    .update({ stripe_customer_id: session.customer as string })
    .eq('id', session.metadata.userId);

  if (userError) {
    console.error('Error updating user stripe_customer_id:', userError);
  }

  // If this is a subscription checkout, the subscription events will handle the rest
  if (session.mode === 'subscription') {
    return;
  }

  // Handle one-time payments (lifetime plans)
  if (session.mode === 'payment' && session.payment_status === 'paid') {
    await handleLifetimePurchase(session);
  }
}

async function handleLifetimePurchase(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseClient();
  if (!session.metadata?.userId) return;

  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: session.metadata.userId,
      stripe_subscription_id: `lifetime_${session.id}`,
      status: 'active',
      plan_type: 'lifetime',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date('2099-12-31').toISOString(), // Far future date
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating lifetime subscription:', error);
  } else {
    console.log('Lifetime subscription created for user:', session.metadata.userId);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();
  const stripe = getStripeClient();
  console.log('Subscription created:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted) {
    console.error('Customer not found for subscription:', subscription.id);
    return;
  }

  // Find user by stripe_customer_id
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (userError || !user) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  // Create subscription record
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan_type: 'premium',
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating subscription:', error);
  } else {
    console.log('Subscription created for user:', user.id);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();
  console.log('Subscription updated:', subscription.id);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log('Subscription updated:', subscription.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();
  console.log('Subscription deleted:', subscription.id);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription status to canceled:', error);
  } else {
    console.log('Subscription marked as canceled:', subscription.id);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();
  console.log('Payment succeeded for invoice:', invoice.id);

  if (!(invoice as any).subscription) return;

  // Find subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', (invoice as any).subscription)
    .single();

  if (subError || !subscription) {
    console.error('Subscription not found for invoice:', invoice.id);
    return;
  }

  // Record payment
  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: subscription.user_id,
      stripe_payment_intent_id: (invoice as any).payment_intent as string,
      amount: (invoice as any).amount_paid / 100, // Convert from cents
      currency: (invoice as any).currency,
      status: 'succeeded',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording payment:', error);
  } else {
    console.log('Payment recorded for user:', subscription.user_id);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();
  console.log('Payment failed for invoice:', invoice.id);

  if (!(invoice as any).subscription) return;

  // Find subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', (invoice as any).subscription)
    .single();

  if (subError || !subscription) {
    console.error('Subscription not found for failed payment:', invoice.id);
    return;
  }

  // Record failed payment
  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: subscription.user_id,
      stripe_payment_intent_id: (invoice as any).payment_intent as string,
      amount: (invoice as any).amount_due / 100, // Convert from cents
      currency: (invoice as any).currency,
      status: 'failed',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording failed payment:', error);
  } else {
    console.log('Failed payment recorded for user:', subscription.user_id);
  }
}