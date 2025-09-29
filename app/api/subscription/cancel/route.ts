import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserSubscriptionAsync, cancelUserSubscriptionAsync } from '@/app/lib/database';

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

export async function POST(request: NextRequest) {
  // Skip during build time
  if (!stripe) {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  try {
    const { userEmail, immediately = false } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('🚫 Cancelling subscription for:', userEmail);

    // Get user subscription data
    const subscriptionData = await getUserSubscriptionAsync(userEmail);
    if (!subscriptionData || !subscriptionData.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Handle lifetime subscriptions (cannot be cancelled via Stripe)
    if (subscriptionData.subscriptionPlan === 'lifetime') {
      // For lifetime plans, we just mark as cancelled in our database
      const success = await cancelUserSubscriptionAsync(userEmail);
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Lifetime subscription access revoked'
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to cancel lifetime subscription' },
          { status: 500 }
        );
      }
    }

    // Cancel Stripe subscription
    let cancelledSubscription: Stripe.Subscription;
    
    if (immediately) {
      // Cancel immediately
      cancelledSubscription = await stripe.subscriptions.cancel(
        subscriptionData.stripeSubscriptionId
      );
    } else {
      // Cancel at period end
      cancelledSubscription = await stripe.subscriptions.update(
        subscriptionData.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );
    }

    console.log('✅ Stripe subscription cancelled:', cancelledSubscription.id);

    // Update our database
    if (immediately) {
      await cancelUserSubscriptionAsync(userEmail);
    }
    // If not immediate, the webhook will handle the update when the period ends

    return NextResponse.json({
      success: true,
      message: immediately 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at the end of the current period',
      cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
      currentPeriodEnd: (cancelledSubscription as any).current_period_end 
        ? new Date((cancelledSubscription as any).current_period_end * 1000).toISOString()
        : null
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}