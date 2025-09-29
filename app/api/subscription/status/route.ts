import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionAsync } from '@/app/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('📊 Getting subscription status for:', userEmail);

    const subscriptionData = await getUserSubscriptionAsync(userEmail);
    
    if (!subscriptionData) {
      return NextResponse.json({
        hasSubscription: false,
        isPremium: false,
        subscriptionPlan: null,
        subscriptionActive: false,
        message: 'No subscription found'
      });
    }

    // Check if subscription is still valid
    const now = new Date();
    let isActive = subscriptionData.subscriptionActive;
    
    // For non-lifetime plans, check if subscription has expired
    if (subscriptionData.subscriptionPlan !== 'lifetime' && subscriptionData.subscriptionCurrentPeriodEnd) {
      const periodEnd = new Date(subscriptionData.subscriptionCurrentPeriodEnd);
      isActive = isActive && now <= periodEnd;
    }

    // For lifetime plans, they're always active unless explicitly cancelled
    if (subscriptionData.subscriptionPlan === 'lifetime') {
      isActive = subscriptionData.subscriptionActive;
    }

    const response = {
      hasSubscription: true,
      isPremium: isActive,
      subscriptionPlan: subscriptionData.subscriptionPlan,
      subscriptionActive: isActive,
      subscriptionCancelAtPeriodEnd: subscriptionData.subscriptionCancelAtPeriodEnd,
      subscriptionCurrentPeriodStart: subscriptionData.subscriptionCurrentPeriodStart,
      subscriptionCurrentPeriodEnd: subscriptionData.subscriptionCurrentPeriodEnd,
      subscriptionCreated: subscriptionData.subscriptionCreated,
      lastPaymentStatus: subscriptionData.lastPaymentStatus,
      nextBillingDate: subscriptionData.nextBillingDate,
      stripeCustomerId: subscriptionData.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId
    };

    console.log('✅ Subscription status retrieved:', {
      email: userEmail,
      isPremium: response.isPremium,
      plan: response.subscriptionPlan
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/subscription/status - Request received');
    
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('📋 Request body:', requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { userEmail } = requestBody;
    console.log('👤 Extracted userEmail:', userEmail);

    if (!userEmail) {
      console.error('❌ Missing userEmail in request');
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Same logic as GET but with POST body
    const subscriptionData = await getUserSubscriptionAsync(userEmail);
    
    if (!subscriptionData) {
      return NextResponse.json({
        hasSubscription: false,
        isPremium: false,
        subscriptionPlan: null,
        subscriptionActive: false,
        message: 'No subscription found'
      });
    }

    const now = new Date();
    let isActive = subscriptionData.subscriptionActive;
    
    if (subscriptionData.subscriptionPlan !== 'lifetime' && subscriptionData.subscriptionCurrentPeriodEnd) {
      const periodEnd = new Date(subscriptionData.subscriptionCurrentPeriodEnd);
      isActive = isActive && now <= periodEnd;
    }

    if (subscriptionData.subscriptionPlan === 'lifetime') {
      isActive = subscriptionData.subscriptionActive;
    }

    const response = {
      hasSubscription: true,
      isPremium: isActive,
      subscriptionPlan: subscriptionData.subscriptionPlan,
      subscriptionActive: isActive,
      subscriptionCancelAtPeriodEnd: subscriptionData.subscriptionCancelAtPeriodEnd,
      subscriptionCurrentPeriodStart: subscriptionData.subscriptionCurrentPeriodStart,
      subscriptionCurrentPeriodEnd: subscriptionData.subscriptionCurrentPeriodEnd,
      subscriptionCreated: subscriptionData.subscriptionCreated,
      lastPaymentStatus: subscriptionData.lastPaymentStatus,
      nextBillingDate: subscriptionData.nextBillingDate,
      stripeCustomerId: subscriptionData.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}