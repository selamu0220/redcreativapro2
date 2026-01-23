import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { upsertSubscription, getSubscriptionByCustomerId } from '@/app/lib/server/subscription-service';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error('Webhook signature verification failed.', error.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    try {
        console.log(`Processing Stripe webhook event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
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

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Error handling webhook event:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;

    if (!userId) {
        console.error('User ID not found in session metadata');
        return;
    }

    if (!session.subscription) {
        console.log('No subscription in session (might be one-time payment)');
        return;
    }

    // Retrieve subscription to get details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await upsertSubscription({
        userId: userId,
        stripeCustomerId: customerId,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
    });

    console.log(`Checkout completed for user ${userId}, subscription ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    // Find existing subscription by customer ID
    const existingSub = await getSubscriptionByCustomerId(customerId);

    if (!existingSub) {
        console.warn('Received subscription update for unknown customer:', customerId);
        return;
    }

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    await upsertSubscription({
        userId: existingSub.userId,
        stripeCustomerId: customerId,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
    });

    console.log(`Subscription updated for user ${existingSub.userId}: status=${subscription.status}, active=${isActive}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    // Find existing subscription by customer ID
    const existingSub = await getSubscriptionByCustomerId(customerId);

    if (!existingSub) {
        console.warn('Received subscription deletion for unknown customer:', customerId);
        return;
    }

    // Update subscription status to canceled
    await upsertSubscription({
        userId: existingSub.userId,
        stripeCustomerId: customerId,
        status: 'canceled',
        priceId: subscription.items.data[0]?.price.id || existingSub.priceId,
        currentPeriodEnd: new Date() // Subscription ended
    });

    console.log(`Subscription deleted for user ${existingSub.userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;

    if (!subscriptionId) {
        console.log('Invoice without subscription (one-time payment)');
        return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = invoice.customer as string;

    // Find existing subscription by customer ID
    const existingSub = await getSubscriptionByCustomerId(customerId);

    if (existingSub) {
        await upsertSubscription({
            userId: existingSub.userId,
            stripeCustomerId: customerId,
            status: subscription.status,
            priceId: subscription.items.data[0].price.id,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
        });
        console.log(`Payment succeeded for user ${existingSub.userId}`);
    } else {
        console.warn('Received invoice payment for unknown customer:', customerId);
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    // Find existing subscription by customer ID
    const existingSub = await getSubscriptionByCustomerId(customerId);

    if (existingSub) {
        // Mark subscription as past_due or update status
        console.log(`Payment failed for user ${existingSub.userId}, invoice ${invoice.id}`);
        // Stripe will automatically update subscription status via subscription.updated event
    }
}

