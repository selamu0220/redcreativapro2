import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createOrUpdateUser, updateUserSubscriptionStatus, isTrialExpired } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, subscriptionStatus, subscriptionId, customerId, subscriptionStartDate, subscriptionEndDate } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Update user subscription in database
    const userData = updateUserSubscriptionStatus(email, subscriptionStatus, {
      subscriptionId,
      customerId,
      subscriptionStartDate,
      subscriptionEndDate,
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error updating subscription:', error);
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

    // Get or create user with trial period
    let userData = getUserByEmail(email);
    
    if (!userData) {
      // Create new user with 7-day trial
      userData = createOrUpdateUser({ email });
    }

    // Check if trial has expired
    if (userData.subscriptionStatus === 'trial' && isTrialExpired(userData)) {
      userData = updateUserSubscriptionStatus(email, 'free') || userData;
    }

    // Calculate remaining trial days
    let remainingTrialDays = 0;
    if (userData.subscriptionStatus === 'trial' && userData.trialStartDate) {
      const trialStart = new Date(userData.trialStartDate);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      remainingTrialDays = Math.max(0, 7 - daysPassed);
    }

    return NextResponse.json({ 
      user: {
        ...userData,
        remainingTrialDays
      }
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}