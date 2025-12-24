import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  updateUserSubscriptionStatusAsync, 
  createOrUpdateUserAsync 
} from '../../../lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
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
  const userId = session.metadata?.userId;
  
  if (!email) {
    console.error('No email found in session');
    return;
  }

  // Determine plan from priceId if needed, or metadata
  const planName = session.metadata?.planName || 'Pro';
  
  await updateUserSubscriptionStatusAsync(email, 'pro', {
    customerId: session.customer as string,
    subscriptionId: session.subscription as string,
    subscriptionActive: true,
    subscriptionStartDate: new Date().toISOString(),
    lastPaymentStatus: 'succeeded',
    isPremium: true
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if (!customer || (customer as Stripe.DeletedCustomer).deleted) return;
  
  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : 'free';

  await updateUserSubscriptionStatusAsync(email, status, {
    subscriptionId: subscription.id,
    subscriptionActive: status === 'pro',
    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    isPremium: status === 'pro'
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if (!customer || (customer as Stripe.DeletedCustomer).deleted) return;
  
  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  await updateUserSubscriptionStatusAsync(email, 'free', {
    subscriptionActive: false,
    subscriptionCanceledAt: new Date().toISOString(),
    isPremium: false
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
