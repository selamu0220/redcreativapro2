import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  updateUserSubscriptionStatusAsync,
  createOrUpdateUserAsync
} from '../../../lib/database';
import { supabaseAdmin } from '../../../lib/auth/supabase-admin';
import { notifyMake, formatPaymentAmount } from '../../../lib/make-utils';

// Lazy initialization to prevent build-time errors
let _stripe: Stripe | null = null;
function getStripeInstance(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }
  return _stripe;
}

function getEndpointSecret(): string {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripeInstance().webhooks.constructEvent(body, sig, getEndpointSecret());
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
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
  const email = session.customer_details?.email || session.metadata?.email;
  // client_reference_id is usually the auth.users.id
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!email) {
    console.error('No email found in session');
    return;
  }

  // Determine plan from priceId or metadata
  const planName = session.metadata?.planName || 'Pro';

  // Update Supabase Profile
  if (userId) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_pro: true,
        subscription_id: session.subscription as string,
        subscription_status: 'active',
        usage_reset_at: new Date().toISOString() // Reset usage on new sub
      })
      .eq('id', userId);

    if (error) console.error('Error updating profile in Supabase:', error);
  } else {
    // Fallback: update by email if no userId provided
    const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
    if (user) {
      await supabaseAdmin
        .from('profiles')
        .update({
          is_pro: true,
          subscription_id: session.subscription as string,
          subscription_status: 'active',
          usage_reset_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }
  }

  // Legacy KV update (optional, keeping for safety if other parts use it)
  await updateUserSubscriptionStatusAsync(email, 'pro', {
    customerId: session.customer as string,
    subscriptionId: session.subscription as string,
    subscriptionActive: true,
    subscriptionStartDate: new Date().toISOString(),
    lastPaymentStatus: 'succeeded',
    isPremium: true
  });

  // Notify Make.com
  await notifyMake('subscription.created', {
    email,
    plan: planName,
    customerId: session.customer,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await getStripeInstance().customers.retrieve(subscription.customer as string);

  if (!customer || (customer as Stripe.DeletedCustomer).deleted) return;

  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const status = isActive ? 'pro' : 'free';

  // Update Supabase
  const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
  if (user) {
    await supabaseAdmin
      .from('profiles')
      .update({
        is_pro: isActive,
        subscription_status: subscription.status,
        subscription_id: subscription.id
      })
      .eq('id', user.id);
  }

  // Update KV
  const periodEnd = (subscription as any).current_period_end;
  await updateUserSubscriptionStatusAsync(email, status, {
    subscriptionId: subscription.id,
    subscriptionActive: isActive,
    subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : undefined,
    isPremium: isActive
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await getStripeInstance().customers.retrieve(subscription.customer as string);

  if (!customer || (customer as Stripe.DeletedCustomer).deleted) return;

  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  // Update Supabase
  const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
  if (user) {
    await supabaseAdmin
      .from('profiles')
      .update({
        is_pro: false,
        subscription_status: 'canceled'
      })
      .eq('id', user.id);
  }

  // Update KV
  await updateUserSubscriptionStatusAsync(email, 'free', {
    subscriptionActive: false,
    subscriptionCanceledAt: new Date().toISOString(),
    isPremium: false
  });

  // Notify Make.com
  await notifyMake('subscription.cancelled', {
    email,
    subscriptionId: subscription.id,
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.customer_email) return;

  // KV Update
  await createOrUpdateUserAsync({
    email: invoice.customer_email,
    lastPaymentStatus: 'succeeded',
    lastActiveAt: new Date().toISOString()
  });

  // Notify Make.com
  const amountPaid = (invoice.amount_paid || 0) / 100;
  await notifyMake('payment.succeeded', {
    email: invoice.customer_email,
    amount: amountPaid,
    amountFormatted: formatPaymentAmount(amountPaid, invoice.currency || 'EUR'),
    currency: invoice.currency?.toUpperCase() || 'EUR',
    invoiceId: invoice.id,
  });
}
