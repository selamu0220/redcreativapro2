import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserSubscriptionAsync, cancelUserSubscriptionAsync } from '@/app/lib/database';

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

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Handle build-time case
  if (!stripe) {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🎯 Stripe webhook event received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      default:
        console.log(`🤷‍♂️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    console.log('🔄 Processing subscription update:', subscription.id);

    // Handle build-time case
    if (!stripe) return;

    // Get customer email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      console.error('❌ Customer not found or deleted');
      return;
    }

    const email = (customer as Stripe.Customer).email;
    if (!email) {
      console.error('❌ Customer email not found');
      return;
    }

    // Determine subscription plan based on price ID
    const priceId = subscription.items.data[0]?.price.id;
    let subscriptionPlan: 'monthly' | 'yearly' | 'lifetime' = 'monthly';
    
    // Map price IDs to plans based on Stripe configuration
    switch (priceId) {
      case 'price_1RnMKwAZjhZ6eQncM71bv8Zh': // Monthly €4.99
        subscriptionPlan = 'monthly';
        break;
      case 'price_1RmjCxAZjhZ6eQncq2G4QoCu': // Yearly €142.80 (30% off)
        subscriptionPlan = 'yearly';
        break;
      case 'price_1RmjF1AZjhZ6eQncFe2Rft19': // Lifetime €429.00
        subscriptionPlan = 'lifetime';
        break;
      default:
        console.warn('⚠️ Unknown price ID:', priceId);
    }

    const subscriptionData = {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeProductId: subscription.items.data[0]?.price.product as string,
      subscriptionPlan,
      subscriptionActive: subscription.status === 'active',
      subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscriptionCurrentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
      subscriptionCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      subscriptionCreated: new Date(subscription.created * 1000).toISOString(),
      lastPaymentStatus: 'succeeded' as const,
      nextBillingDate: subscriptionPlan !== 'lifetime' ? new Date((subscription as any).current_period_end * 1000).toISOString() : undefined
    };

    const success = await updateUserSubscriptionAsync(email, subscriptionData);
    if (success) {
      console.log('✅ Subscription updated successfully for:', email);
    } else {
      console.error('❌ Failed to update subscription for:', email);
    }
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    console.log('🚫 Processing subscription cancellation:', subscription.id);

    // Handle build-time case
    if (!stripe) return;

    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) return;

    const email = (customer as Stripe.Customer).email;
    if (!email) return;

    const success = await cancelUserSubscriptionAsync(email);
    if (success) {
      console.log('✅ Subscription cancelled successfully for:', email);
    } else {
      console.error('❌ Failed to cancel subscription for:', email);
    }
  } catch (error) {
    console.error('❌ Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('💳 Processing successful payment:', invoice.id);

    // Handle build-time case
    if (!stripe) return;

    if (!(invoice as any).subscription) return;

    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    await handleSubscriptionUpdate(subscription);
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('💳❌ Processing failed payment:', invoice.id);

    // Handle build-time case
    if (!stripe) return;

    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (!customer || customer.deleted) return;

    const email = (customer as Stripe.Customer).email;
    if (!email) return;

    // Update payment status to failed
    await updateUserSubscriptionAsync(email, {
      lastPaymentStatus: 'failed'
    });

    console.log('⚠️ Payment failed status updated for:', email);
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('🛒 Processing completed checkout:', session.id);

    // Handle build-time case
    if (!stripe) return;

    if (!session.subscription) {
      // Handle one-time payments (lifetime plan)
      if (session.mode === 'payment' && session.customer) {
        const customer = await stripe.customers.retrieve(session.customer as string);
        if (!customer || customer.deleted) return;

        const email = (customer as Stripe.Customer).email;
        if (!email) return;

        // For lifetime purchases, create a special subscription record
        await updateUserSubscriptionAsync(email, {
          stripeCustomerId: session.customer as string,
          subscriptionPlan: 'lifetime',
          subscriptionActive: true,
          subscriptionCreated: new Date().toISOString(),
          lastPaymentStatus: 'succeeded'
        });

        console.log('✅ Lifetime subscription activated for:', email);
      }
      return;
    }

    // Handle recurring subscriptions
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdate(subscription);
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
}