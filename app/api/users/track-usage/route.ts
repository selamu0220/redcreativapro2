import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createOrUpdateUser, getTodayUsage, incrementUsage, isTrialExpired, updateUserSubscriptionStatus, hasUnlimitedAccess } from '../../../lib/database';


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

    // Check if trial has expired and update status
    if (user.subscriptionStatus === 'trial' && isTrialExpired(user)) {
      user = await updateUserSubscriptionStatus(email, 'free') || user;
    }

    // Block access if trial expired or user is free (not paid)
    if ((user.subscriptionStatus === 'free' || (user.subscriptionStatus === 'trial' && isTrialExpired(user))) && !hasUnlimitedAccess(email)) {
      return NextResponse.json(
        { 
          error: 'Subscription required', 
          message: 'Tu período de prueba ha expirado. Suscríbete para continuar usando la aplicación.',
          subscriptionStatus: user.subscriptionStatus,
          trialExpired: true
        },
        { status: 402 } // Payment Required
      );
    }

    // Get today's usage
    const todayUsage = await getTodayUsage(email);
    
    // Check if user has unlimited access (admin or premium subscription)
    const isUnlimited = hasUnlimitedAccess(email) || user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'premium';
    
    // Calculate limits based on subscription
    const limits = {
      escritorIA: {
        used: todayUsage.escritorIA || 0,
        limit: isUnlimited ? 'unlimited' as const : 10,
        remaining: isUnlimited ? 'unlimited' as const : Math.max(0, 10 - (todayUsage.escritorIA || 0))
      },
      correosIA: {
        used: todayUsage.correosIA || 0,
        limit: isUnlimited ? 'unlimited' as const : 5,
        remaining: isUnlimited ? 'unlimited' as const : Math.max(0, 5 - (todayUsage.correosIA || 0))
      },
      prompts: {
        used: todayUsage.prompts || 0,
        limit: isUnlimited ? 'unlimited' as const : 3,
        remaining: isUnlimited ? 'unlimited' as const : Math.max(0, 3 - (todayUsage.prompts || 0))
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
    let userData = await getUserByEmail(email);
    if (!userData) {
      userData = await createOrUpdateUser({ email });
    }

    // Check if trial has expired and update status
    if (userData.subscriptionStatus === 'trial' && isTrialExpired(userData)) {
      userData = await updateUserSubscriptionStatus(email, 'free') || userData;
    }

    // Block access if trial expired or user is free (not paid)
    if ((userData.subscriptionStatus === 'free' || (userData.subscriptionStatus === 'trial' && isTrialExpired(userData))) && !hasUnlimitedAccess(email)) {
      return NextResponse.json(
        { 
          error: 'Subscription required', 
          message: 'Tu período de prueba ha expirado. Suscríbete para continuar usando la aplicación.',
          subscriptionStatus: userData.subscriptionStatus,
          trialExpired: true
        },
        { status: 402 } // Payment Required
      );
    }

    // Get current usage
    const currentUsage = await getTodayUsage(email);
    
    // Check if user has unlimited access (admin or premium subscription)
    const isUnlimited = hasUnlimitedAccess(email) || userData.subscriptionStatus === 'pro' || userData.subscriptionStatus === 'premium';
    
    // Define limits for all subscription types
    const limits = {
      free: { escritorIA: 2, correosIA: 2, prompts: 2 },
      trial: { escritorIA: 2, correosIA: 2, prompts: 2 },
      pro: { escritorIA: -1, correosIA: -1, prompts: -1 }, // -1 means unlimited
      premium: { escritorIA: -1, correosIA: -1, prompts: -1 },
    };

    const userLimits = limits[userData.subscriptionStatus] || limits.free;
    
    // Check limits before incrementing (skip for unlimited users)
    if (!isUnlimited) {
      const toolLimit = userLimits[tool as keyof typeof userLimits];
      
      if (toolLimit !== -1 && Number(currentUsage[tool as keyof typeof currentUsage]) >= toolLimit) {
        return NextResponse.json(
          { error: 'Daily limit reached for this tool', usage: currentUsage, limits: userLimits },
          { status: 429 }
        );
      }
    }

    // Increment usage
    const updatedUsage = await incrementUsage(email, tool as 'escritorIA' | 'correosIA' | 'prompts');

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

