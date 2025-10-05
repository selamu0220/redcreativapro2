import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}



export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!userEmail && !userId) {
      return NextResponse.json(
        { error: 'User email or userId is required' },
        { status: 400 }
      );
    }

    console.log('📊 Getting subscription status for:', userEmail || userId);

    // Get user ID if only email provided
    let finalUserId = userId;
    if (!finalUserId && userEmail) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (!userData) {
        return NextResponse.json({
          planType: 'free',
          isActive: false,
          daysRemaining: 0,
          canAccessTools: false,
          message: 'User not found'
        });
      }
      finalUserId = userData.id;
    }

    // Calculate days remaining using our SQL function
    const { data: daysData, error: daysError } = await supabase
      .rpc('calculate_days_remaining', { user_uuid: finalUserId });

    if (daysError) {
      console.error('Error calculating days:', daysError);
      return NextResponse.json({ error: 'Failed to calculate remaining days' }, { status: 500 });
    }

    const daysRemaining = daysData || 0;

    // Check for active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', finalUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get user trial info
    const { data: userData } = await supabase
      .from('users')
      .select('trial_started_at, trial_used')
      .eq('id', finalUserId)
      .single();

    let planType = 'free';
    let isActive = false;
    let canAccessTools = false;

    if (subscription) {
      // User has active subscription
      planType = subscription.plan_type;
      isActive = true;
      canAccessTools = true;
    } else if (daysRemaining > 0) {
      // User in trial period
      planType = 'trial';
      isActive = true;
      canAccessTools = true;
    } else {
      // User expired
      planType = 'expired';
      isActive = false;
      canAccessTools = false;
    }

    const response = {
      planType,
      isActive,
      daysRemaining,
      canAccessTools,
      subscription: subscription || null,
      trialInfo: userData || null,
      expirationDate: subscription?.current_period_end || null
    };

    console.log('✅ Subscription status retrieved:', {
      userId: finalUserId,
      planType,
      daysRemaining,
      canAccessTools
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
    const supabase = getSupabaseClient();
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

    const { userEmail, userId } = requestBody;
    console.log('👤 Extracted userEmail/userId:', userEmail || userId);

    if (!userEmail && !userId) {
      console.error('❌ Missing userEmail or userId in request');
      return NextResponse.json(
        { error: 'User email or userId is required' },
        { status: 400 }
      );
    }

    // Get user ID if only email provided
    let finalUserId = userId;
    if (!finalUserId && userEmail) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (!userData) {
        return NextResponse.json({
          planType: 'free',
          isActive: false,
          daysRemaining: 0,
          canAccessTools: false,
          message: 'User not found'
        });
      }
      finalUserId = userData.id;
    }

    // Calculate days remaining using our SQL function
    const { data: daysData, error: daysError } = await supabase
      .rpc('calculate_days_remaining', { user_uuid: finalUserId });

    if (daysError) {
      console.error('Error calculating days:', daysError);
      return NextResponse.json({ error: 'Failed to calculate remaining days' }, { status: 500 });
    }

    const daysRemaining = daysData || 0;

    // Check for active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', finalUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get user trial info
    const { data: userData } = await supabase
      .from('users')
      .select('trial_started_at, trial_used')
      .eq('id', finalUserId)
      .single();

    let planType = 'free';
    let isActive = false;
    let canAccessTools = false;

    if (subscription) {
      // User has active subscription
      planType = subscription.plan_type;
      isActive = true;
      canAccessTools = true;
    } else if (daysRemaining > 0) {
      // User in trial period
      planType = 'trial';
      isActive = true;
      canAccessTools = true;
    } else {
      // User expired
      planType = 'expired';
      isActive = false;
      canAccessTools = false;
    }

    const response = {
      planType,
      isActive,
      daysRemaining,
      canAccessTools,
      subscription: subscription || null,
      trialInfo: userData || null,
      expirationDate: subscription?.current_period_end || null
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