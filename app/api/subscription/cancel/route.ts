import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getSubscription } from '@/app/lib/server/subscription-service';

export async function POST(req: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user's subscription from database
        const subscription = await getSubscription(user.id);

        if (!subscription) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        // Get the Stripe subscription ID from our database
        // The subscription document should have stripeSubscriptionId or we need to look it up
        const stripeCustomerId = subscription.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
        }

        // List active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const stripeSubscription = subscriptions.data[0];

        // Cancel at period end (user keeps access until subscription ends)
        const cancelledSubscription = await stripe.subscriptions.update(stripeSubscription.id, {
            cancel_at_period_end: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription will be cancelled at the end of the billing period',
            cancelAt: new Date((cancelledSubscription as any).current_period_end * 1000).toISOString(),
        });
    } catch (error: any) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
