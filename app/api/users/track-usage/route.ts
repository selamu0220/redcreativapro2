import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createOrUpdateUser, getTodayUsage, incrementUsage, isTrialExpired, updateUserSubscriptionStatus } from '../../../lib/database';

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
    let userData = getUserByEmail(email);
    if (!userData) {
      userData = createOrUpdateUser({ email });
    }

    // Check if trial has expired
    if (userData.subscriptionStatus === 'trial' && isTrialExpired(userData)) {
      userData = updateUserSubscriptionStatus(email, 'free') || userData;
    }

    // Get today's usage
    const usage = getTodayUsage(email);
    
    // Get limits based on subscription status
    const limits = {
      free: { escritorIA: 2, correosIA: 2, prompts: 2 },
      trial: { escritorIA: 2, correosIA: 2, prompts: 2 },
      pro: { escritorIA: -1, correosIA: -1, prompts: -1 }, // -1 means unlimited
      premium: { escritorIA: -1, correosIA: -1, prompts: -1 },
    };

    const userLimits = limits[userData.subscriptionStatus] || limits.free;

    // Calculate remaining trial days
    let remainingTrialDays = 0;
    if (userData.subscriptionStatus === 'trial' && userData.trialStartDate) {
      const trialStart = new Date(userData.trialStartDate);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      remainingTrialDays = Math.max(0, 7 - daysPassed);
    }

    return NextResponse.json({ 
      usage, 
      limits: userLimits,
      user: {
        ...userData,
        remainingTrialDays
      }
    });
  } catch (error) {
    console.error('Error getting usage data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}