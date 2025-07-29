import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createOrUpdateUser, getTodayUsage, incrementUsage, isTrialExpired, updateUserSubscriptionStatus } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createOrUpdateUser({
        email,
        subscriptionStatus: 'trial',
        trialStartDate: new Date().toISOString()
      });
    }

    // Get today's usage
    const todayUsage = await getTodayUsage(email);
    
    // Calculate limits based on subscription
    const limits = {
      escritorIA: {
        used: todayUsage.escritorIA || 0,
        limit: user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium' ? 'unlimited' as const : 10,
        remaining: user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium' ? 'unlimited' as const : Math.max(0, 10 - (todayUsage.escritorIA || 0))
      },
      correosIA: {
        used: todayUsage.correosIA || 0,
        limit: user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium' ? 'unlimited' as const : 5,
        remaining: user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium' ? 'unlimited' as const : Math.max(0, 5 - (todayUsage.correosIA || 0))
      },
      prompts: {
        used: todayUsage.prompts || 0,
        limit: user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium' ? 'unlimited' as const : 3,
        remaining: user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium' ? 'unlimited' as const : Math.max(0, 3 - (todayUsage.prompts || 0))
      }
    };

    return NextResponse.json({ user, limits });
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, tool } = await request.json();

    if (!email || !tool) {
      return NextResponse.json(
        { error: 'Email and tool are required' },
        { status: 400 }
      );
    }

    if (!['escritorIA', 'correosIA', 'prompts'].includes(tool)) {
      return NextResponse.json(
        { error: 'Invalid tool type' },
        { status: 400 }
      );
    }

    // Get or create user
    let userData = getUserByEmail(email);
    if (!userData) {
      userData = createOrUpdateUser({ email });
    }

    // Check if trial has expired
    if (userData.subscriptionStatus === 'trial' && isTrialExpired(userData)) {
      userData = updateUserSubscriptionStatus(email, 'free') || userData;
    }

    // Get current usage
    const currentUsage = getTodayUsage(email);
    
    // Check limits before incrementing
    const limits = {
      free: { escritorIA: 2, correosIA: 2, prompts: 2 },
      trial: { escritorIA: 2, correosIA: 2, prompts: 2 },
      pro: { escritorIA: -1, correosIA: -1, prompts: -1 }, // -1 means unlimited
      premium: { escritorIA: -1, correosIA: -1, prompts: -1 },
    };

    const userLimits = limits[userData.subscriptionStatus] || limits.free;
    const toolLimit = userLimits[tool as keyof typeof userLimits];
    
    if (toolLimit !== -1 && Number(currentUsage[tool as keyof typeof currentUsage]) >= toolLimit) {
      return NextResponse.json(
        { error: 'Daily limit reached for this tool', usage: currentUsage, limits: userLimits },
        { status: 429 }
      );
    }

    // Increment usage
    const updatedUsage = incrementUsage(email, tool as 'escritorIA' | 'correosIA' | 'prompts');

    return NextResponse.json({ 
      success: true, 
      usage: updatedUsage, 
      limits: userLimits,
      user: userData
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

