import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  updateUserSubscriptionStatusAsync, 
  getUserByEmailAsync,
  createOrUpdateUserAsync 
} from '../../../lib/database';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-01-27.acacia' as any,
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
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
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
  console.log('Checkout completed:', session.id);
  const email = session.customer_details?.email || session.metadata?.email;
  
  if (!email) {
    console.error('No email found in session');
    return;
  }

  const status = session.mode === 'subscription' ? 'premium' : 'pro';
  
  await updateUserSubscriptionStatusAsync(email, status as any, {
    customerId: session.customer as string,
    subscriptionId: session.subscription as string,
    subscriptionActive: true,
    lastPaymentStatus: 'succeeded'
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripe = getStripeClient();
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if (!customer || (customer as Stripe.DeletedCustomer).deleted) return;
  
  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  const statusMap: Record<string, any> = {
    'active': 'premium',
    'trialing': 'trial',
    'past_due': 'free',
    'canceled': 'free',
    'unpaid': 'free'
  };

  await updateUserSubscriptionStatusAsync(email, statusMap[subscription.status] || 'free', {
    subscriptionId: subscription.id,
    subscriptionActive: subscription.status === 'active' || subscription.status === 'trialing',
    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripe = getStripeClient();
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if (!customer || (customer as Stripe.DeletedCustomer).deleted) return;
  
  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  await updateUserSubscriptionStatusAsync(email, 'free', {
    subscriptionActive: false,
    subscriptionCanceledAt: new Date().toISOString()
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.customer_email) return;
  
  await createOrUpdateUserAsync({
    email: invoice.customer_email,
    lastPaymentStatus: 'succeeded',
    lastActiveAt: new Date().toISOString()
  });
}
