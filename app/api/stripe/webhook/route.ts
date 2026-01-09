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
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // We stored userId in metadata during checkout creation
            const userId = session.metadata?.userId;

            if (!userId) {
                console.error('User ID not found in session metadata');
                return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
            }

            // Retrieve subscription to get details
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

            await upsertSubscription({
                userId: userId,
                stripeCustomerId: session.customer as string,
                status: subscription.status,
                priceId: subscription.items.data[0].price.id,
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
            });

        } else if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = (invoice as any).subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            // Find existing subscription by customer ID
            const existingSub = await getSubscriptionByCustomerId(invoice.customer as string);

            if (existingSub) {
                await upsertSubscription({
                    userId: existingSub.userId,
                    stripeCustomerId: invoice.customer as string,
                    status: subscription.status,
                    priceId: subscription.items.data[0].price.id,
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
                });
            } else {
                console.warn('Received invoice payment for unknown customer:', invoice.customer);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Error handling webhook event:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
