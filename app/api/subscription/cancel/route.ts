import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Verificar que las variables no sean placeholders
  if (!supabaseUrl || !supabaseServiceKey || 
      supabaseUrl === 'your_supabase_url' || 
      supabaseServiceKey === 'your_supabase_service_role_key') {
    console.warn('Supabase environment variables not configured or using placeholder values');
    return null;
  }
  
  try {
    // Validar URL
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    return null;
  }
}

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('Missing Stripe secret key');
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
}



export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const stripe = getStripeClient();
    const { subscriptionId, reason, feedback, userId } = await request.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Subscription ID and User ID are required' },
        { status: 400 }
      );
    }

    console.log('🚫 Cancelling subscription:', subscriptionId);

    // Cancel subscription in Stripe
    const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Get the subscription details to access current_period_end
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    // Log cancellation feedback if provided
    if (reason || feedback) {
      await supabase
        .from('suggestions')
        .insert({
          user_id: userId,
          message: `Cancellation feedback: ${reason || 'No reason provided'}. ${feedback || ''}`,
          category: 'cancellation'
        });
    }

    console.log('✅ Subscription cancelled successfully');

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      cancelAtPeriodEnd: true,
      periodEnd: (subscription as any).current_period_end
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