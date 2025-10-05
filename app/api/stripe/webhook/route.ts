import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserByEmailAsync, createOrUpdateUserAsync, updateUserSubscriptionStatusAsync } from '../../../lib/database';

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
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(stripe, createdSubscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(stripe, updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(stripe, deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const successfulInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(successfulInvoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  if (session.customer_email) {
    // Get or create user
    let userData = await getUserByEmailAsync(session.customer_email);
    if (!userData) {
      userData = await createOrUpdateUserAsync({ email: session.customer_email });
    }

    // Update subscription status
    const planType = session.metadata?.planType || 'pro';
    const subscriptionStatus = planType === 'premium' ? 'premium' : 'pro';
    
    await updateUserSubscriptionStatusAsync(session.customer_email, subscriptionStatus, {
      customerId: session.customer as string,
      subscriptionId: session.subscription as string,
      subscriptionStartDate: new Date().toISOString(),
    });
    
    console.log(`User ${session.customer_email} upgraded to ${subscriptionStatus}`);
  }
}

async function handleSubscriptionCreated(stripe: Stripe, subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer && !customer.deleted && customer.email) {
    // Get or create user
    let userData = await getUserByEmailAsync(customer.email);
    if (!userData) {
      userData = await createOrUpdateUserAsync({ email: customer.email });
    }

    await updateUserSubscriptionStatusAsync(customer.email, 'pro', {
      customerId: customer.id,
      subscriptionId: subscription.id,
      subscriptionStartDate: new Date().toISOString(),
    });
    
    console.log(`Subscription created for ${customer.email}`);
  }
}

async function handleSubscriptionUpdated(stripe: Stripe, subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer && !customer.deleted && customer.email) {
    const status = subscription.status === 'active' ? 'pro' : 'free';
    
    await updateUserSubscriptionStatusAsync(customer.email, status, {
      customerId: customer.id,
      subscriptionId: subscription.id,
      subscriptionStartDate: subscription.status === 'active' ? new Date().toISOString() : undefined,
      subscriptionEndDate: subscription.status !== 'active' ? new Date().toISOString() : undefined,
    });
    
    console.log(`Subscription updated for ${customer.email}: ${status}`);
  }
}

async function handleSubscriptionDeleted(stripe: Stripe, subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer && !customer.deleted && customer.email) {
    await updateUserSubscriptionStatusAsync(customer.email, 'free', {
      customerId: customer.id,
      subscriptionId: undefined,
      subscriptionEndDate: new Date().toISOString(),
    });
    
    console.log(`Subscription cancelled for ${customer.email}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  if (invoice.customer_email) {
    // Get or create user
    let userData = await getUserByEmailAsync(invoice.customer_email);
    if (!userData) {
      userData = await createOrUpdateUserAsync({ email: invoice.customer_email });
    }

    await updateUserSubscriptionStatusAsync(invoice.customer_email, 'pro', {
      customerId: invoice.customer as string,
      subscriptionId: (invoice as any).subscription as string | undefined,
    });
    
    console.log(`Payment succeeded for ${invoice.customer_email}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  
  if (invoice.customer_email) {
    // Don't immediately downgrade on payment failure
    // Stripe will handle retries and eventual subscription cancellation
    console.log(`Payment failed for ${invoice.customer_email} - subscription will be handled by Stripe`);
  }
}