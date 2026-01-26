import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { serverUsage } from '@/app/lib/usage/server-usage';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    // TODO: Implement premium check with Kinde roles/permissions
    const isPremium = false;

    // Get usage from KV
    const usage = await serverUsage.getUsage(userId);
    const limit = 3; // Standard limit for free users

    return NextResponse.json({
      usage,
      limit,
      isPremium,
      subscriptionStatus: isPremium ? 'premium' : 'free'
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Allow incrementing via POST
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    // TODO: Implement premium check with Kinde roles/permissions
    const isPremium = false;

    if (isPremium) {
      return NextResponse.json({ success: true, message: 'Premium user, usage not tracked' });
    }

    const newUsage = await serverUsage.incrementUsage(userId);

    return NextResponse.json({
      success: true,
      usage: newUsage,
      limit: 3
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
